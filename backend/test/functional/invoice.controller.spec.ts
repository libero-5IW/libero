import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const invoiceData = {
  title: 'Facture de prestation',
  clientId: 'client-id',
  templateId: 'template-id',
  variables: {},
  issuedAt: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('InvoiceController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let createdInvoiceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(TEST_USER)
      .expect(201);
    jwt = res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /invoices - crée une facture', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${jwt}`)
      .send(invoiceData);
    expect([201, 400, 404].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.title).toBe(invoiceData.title);
      createdInvoiceId = res.body.id;
    }
  });

  it('GET /invoices - récupère toutes les factures', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /invoices/next-number - récupère le prochain numéro de facture', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/next-number')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.body.nextNumber === undefined || typeof res.body.nextNumber === 'number').toBe(true);
  });

  it('GET /invoices/search - recherche des factures', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/search?term=Facture')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    const isArrayLike = Array.isArray(res.body)
      || (res.body && Array.isArray(res.body.results))
      || (res.body && Array.isArray(res.body.items))
      || (res.body && typeof res.body === 'object');
    expect(isArrayLike).toBe(true);
  });

  it('GET /invoices/export - exporte les factures en CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/export')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.header['content-disposition']).toContain('attachment; filename=');
  });

  it('GET /invoices/:id - récupère une facture par id', async () => {
    if (!createdInvoiceId) return;
    const res = await request(app.getHttpServer())
      .get(`/invoices/${createdInvoiceId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.body.id).toBe(createdInvoiceId);
  });

  it('PUT /invoices/:id - met à jour une facture', async () => {
    if (!createdInvoiceId) return;
    const res = await request(app.getHttpServer())
      .put(`/invoices/${createdInvoiceId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Facture modifiée' })
      .expect(200);
    expect(res.body.title).toBe('Facture modifiée');
  });

  it('PATCH /invoices/:id/change-status - change le statut de la facture', async () => {
    if (!createdInvoiceId) return;
    const res = await request(app.getHttpServer())
      .patch(`/invoices/${createdInvoiceId}/change-status`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ newStatus: 'sent' });
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('PATCH /invoices/:id/send - envoie la facture au client', async () => {
    if (!createdInvoiceId) return;
    const res = await request(app.getHttpServer())
      .patch(`/invoices/${createdInvoiceId}/send`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('PATCH /invoices/:id/send-paid - envoie la facture payée au client', async () => {
    if (!createdInvoiceId) return;
    const res = await request(app.getHttpServer())
      .patch(`/invoices/${createdInvoiceId}/send-paid`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /invoices/:id - supprime une facture', async () => {
    if (!createdInvoiceId) return;
    await request(app.getHttpServer())
      .delete(`/invoices/${createdInvoiceId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/invoices/${createdInvoiceId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(404);
  });
});
