import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('QuoteController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let quoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.quote.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Quote',
        lastName: 'Tester',
        email: 'quote@example.com',
        password,
        addressLine: '8 rue devis',
        postalCode: '75008',
        city: 'Paris',
        legalStatus: 'SASU',
        siret: '66666666600066'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'quote@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /quotes', async () => {
    const res = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        templateId: null,
        contentHtml: '<p>Devis</p>',
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        variableValues: []
      })
      .expect(201);

    quoteId = res.body.id;
  });

  it('GET /quotes', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /quotes/next-number', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/next-number')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(typeof res.body).toBe('number');
  });

  it('GET /quotes/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/search')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.quote)).toBe(true);
  });

  it('GET /quotes/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/quotes/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('GET /quotes/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', quoteId);
  });

  it('PUT /quotes/:id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        contentHtml: '<p>Devis modifié</p>',
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
        variableValues: []
      })
      .expect(200);

    expect(res.body.contentHtml).toContain('modifi');
  });

  it('PATCH /quotes/:id/status', async () => {
    await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sent' })
      .expect(200);
  });

  it('PATCH /quotes/:id/send', async () => {
    await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('DELETE /quotes/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});