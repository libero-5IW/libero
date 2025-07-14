import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('ClientController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let clientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.client.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'clienttest@example.com',
        password,
        addressLine: '1 rue test',
        postalCode: '75001',
        city: 'Paris',
        legalStatus: 'EI',
        siret: '11111111100011'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'clienttest@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /clients', async () => {
    const res = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Client',
        lastName: 'Test',
        email: 'client@example.com',
        phoneNumber: '0601020304',
        addressLine: '2 rue de test',
        postalCode: '75002',
        city: 'Paris'
      })
      .expect(201);

    clientId = res.body.id;
  });

  it('GET /clients', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /clients/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', 'client@example.com');
  });

  it('PATCH /clients/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'Lyon' })
      .expect(200);

    expect(res.body).toHaveProperty('city', 'Lyon');
  });

  it('GET /clients/search/:term', async () => {
    const res = await request(app.getHttpServer())
      .get(`/clients/search/client`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /clients/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('DELETE /clients/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
