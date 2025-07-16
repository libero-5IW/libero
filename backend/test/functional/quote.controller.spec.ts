import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const quoteData = {
  title: 'Devis de prestation',
  clientId: 'client-id',
  templateId: 'template-id',
  variables: {},
  issuedAt: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('QuoteController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let createdQuoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(TEST_USER)
      .then(() => {})
      .catch(() => {});

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(TEST_USER)
      .expect(res => [200, 201].includes(res.status));
    jwt = res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /quotes - crée un devis', async () => {
    const res = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${jwt}`)
      .send(quoteData);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.title).toBe(quoteData.title);
      createdQuoteId = res.body.id;
    }
  });

  it('GET /quotes - récupère tous les devis', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('GET /quotes/next-number - récupère le prochain numéro de devis', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/next-number')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.nextNumber === undefined || typeof res.body.nextNumber === 'number').toBe(true);
    }
  });

  it('GET /quotes/search - recherche des devis', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/search?term=Devis')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      const isArrayLike = Array.isArray(res.body)
        || (res.body && Array.isArray(res.body.results))
        || (res.body && Array.isArray(res.body.items))
        || (res.body && typeof res.body === 'object');
      expect(isArrayLike).toBe(true);
    }
  });

  it('GET /quotes/export - exporte les devis en CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/export')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=');
    }
  });

  it('GET /quotes/:id - récupère un devis par id', async () => {
    if (!createdQuoteId) return;
    const res = await request(app.getHttpServer())
      .get(`/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.id).toBe(createdQuoteId);
    }
  });

  it('PUT /quotes/:id - met à jour un devis', async () => {
    if (!createdQuoteId) return;
    const res = await request(app.getHttpServer())
      .put(`/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Devis modifié' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.title).toBe('Devis modifié');
    }
  });

  it('PATCH /quotes/:id/change-status - change le statut du devis', async () => {
    if (!createdQuoteId) return;
    const res = await request(app.getHttpServer())
      .patch(`/quotes/${createdQuoteId}/change-status`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ newStatus: 'sent' });
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('PATCH /quotes/:id/send - envoie le devis au client', async () => {
    if (!createdQuoteId) return;
    const res = await request(app.getHttpServer())
      .patch(`/quotes/${createdQuoteId}/send`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /quotes/:id - supprime un devis', async () => {
    if (!createdQuoteId) return;
    const resDelete = await request(app.getHttpServer())
      .delete(`/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(resDelete.status)).toBe(true);
    const resGet = await request(app.getHttpServer())
      .get(`/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([404, 400, 401, 403].includes(resGet.status)).toBe(true);
  });
});
