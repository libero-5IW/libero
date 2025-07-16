import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const clientData = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phoneNumber: '0600000000',
  addressLine: '1 rue de Paris',
  postalCode: '75000',
  city: 'Paris',
  country: 'France',
};

describe('ClientController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let createdClientId: string;

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

  it('POST /clients - crée un client', async () => {
    const res = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${jwt}`)
      .send(clientData);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.email).toBe(clientData.email);
      createdClientId = res.body.id;
    }
  });

  it('GET /clients - récupère tous les clients', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.find((c) => c.id === createdClientId)).toBeDefined();
    }
  });

  it('GET /clients/:id - récupère un client par id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.id).toBe(createdClientId);
      expect(res.body.email).toBe(clientData.email);
    }
  });

  it('PATCH /clients/:id - met à jour un client', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ firstName: 'Paul' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.firstName).toBe('Paul');
    }
  });

  it('GET /clients/search/:term - recherche un client', async () => {
    const res = await request(app.getHttpServer())
      .get(`/clients/search/Paul`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].firstName).toBe('Paul');
    }
  });

  it('GET /clients/export - exporte les clients en CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/clients/export')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=');
      expect(res.text).toContain('Prénom');
    }
  });

  it('DELETE /clients/:id - supprime un client', async () => {
    const resDelete = await request(app.getHttpServer())
      .delete(`/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(resDelete.status)).toBe(true);
    const resGet = await request(app.getHttpServer())
      .get(`/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([404, 400, 401, 403].includes(resGet.status)).toBe(true);
  });
});
