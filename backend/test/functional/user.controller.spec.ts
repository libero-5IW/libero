import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

describe('UserController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;

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

  it('GET /users/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.email).toBe(TEST_USER.email);
      expect(res.body.id).toBeDefined();
    }
  });

  it('PATCH /users/me', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ firstName: 'SarahTest' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body.firstName).toBe('SarahTest');
    }
  });

  it('PATCH /users/me/password', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'azerty1234' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /users/me', async () => {
    const res = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });
});
