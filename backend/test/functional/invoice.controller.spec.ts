import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

describe('InvoiceController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let invoiceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.invoice.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Invoice',
        lastName: 'Tester',
        email: 'invoiceuser@example.com',
        password,
        addressLine: '10 rue invoice',
        postalCode: '75010',
        city: 'Paris',
        legalStatus: 'SAS',
        siret: '33333333300033',
      },
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invoiceuser@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /invoices', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        number: 1,
        contentHtml: '<p>Facture</p>',
        pdfKey: 'invoice.pdf',
        previewKey: 'preview.png',
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        variableValues: [
          {
            variableName: 'montant',
            label: 'Montant',
            type: 'string',
            required: true,
            value: '1000€'
          }
        ]
      })
      .expect(201);

    invoiceId = res.body.id;
  });

  it('GET /invoices', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /invoices/next-number', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/next-number')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(typeof res.body).toBe('number');
  });

  it('GET /invoices/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/search')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /invoices/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('GET /invoices/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', invoiceId);
  });

  it('PUT /invoices/:id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        variableValues: [
          {
            variableName: 'montant',
            label: 'Montant',
            type: 'string',
            required: true,
            value: '2000€'
          }
        ]
      })
      .expect(200);

    expect(res.body.variableValues[0].value).toBe('2000€');
  });

  it('PATCH /invoices/:id/change-status', async () => {
    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}/change-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newStatus: InvoiceStatus.paid })
      .expect(200);
  });

  it('PATCH /invoices/:id/send', async () => {
    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('PATCH /invoices/:id/send-paid', async () => {
    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}/send-paid`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('DELETE /invoices/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});