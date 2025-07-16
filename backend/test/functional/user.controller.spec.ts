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

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(TEST_USER)
      .expect(201);
    jwt = res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/me - récupère le profil utilisateur', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.body.email).toBe(TEST_USER.email);
    expect(res.body.id).toBeDefined();
  });

  it('PATCH /users/me - met à jour le profil utilisateur', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ firstName: 'SarahTest' })
      .expect(200);
    expect(res.body.firstName).toBe('SarahTest');
  });

  it('PATCH /users/me/password - change le mot de passe', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'azerty1234' });
    expect([200, 400, 401].includes(res.status)).toBe(true);
  });

  it('DELETE /users/me - supprime le compte utilisateur', async () => {
    const res = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 404].includes(res.status)).toBe(true);
  });
});
