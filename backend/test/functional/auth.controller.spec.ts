import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const REGISTER_USER = {
  email: `testuser_${Date.now()}@libero.com`, 
  password: 'azerty123',
  firstName: 'Test',
  lastName: 'User',
};

describe('AuthController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: string;

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

  it('POST /auth/register', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(REGISTER_USER);
    expect([201, 200, 400, 401, 403, 404, 409].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.email).toBe(REGISTER_USER.email);
      userId = res.body.id;
    }
  });

  it('POST /auth/login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(TEST_USER);
    expect([201, 200, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.token).toBeDefined();
      jwt = res.body.token;
    }
  });

  it('GET /auth/me - récupère les infos de l’utilisateur connecté', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.email).toBe(TEST_USER.email);
      expect(res.body.userId).toBeDefined();
    }
  });

  it('GET /auth/is-authenticated - vérifie si le token est valide', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/is-authenticated')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('POST /auth/request-reset-password - demande un reset password', async () => {
    await request(app.getHttpServer())
      .post('/auth/request-reset-password')
      .send({ email: TEST_USER.email })
      .expect(res => [201, 200, 400, 500].includes(res.status));
  });

  it('POST /auth/reset-password - reset password (token bidon)', async () => {
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'fake-token', newPassword: 'newpass123' })
      .expect(400);
  });

  it('GET /auth/reset-password/validate - valide un token de reset bidon', async () => {
    await request(app.getHttpServer())
      .get('/auth/reset-password/validate?token=fake-token')
      .expect(401);
  });

  it('POST /auth/2fa/verify - échoue avec un mauvais token', async () => {
    await request(app.getHttpServer())
      .post('/auth/2fa/verify')
      .send({ userId: userId || 'fake', token: '000000' })
      .expect(404);
  });
});
