import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('AuthController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const user = await prisma.user.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Salamani',
        email: 'sarah@example.com',
        password: hashedPassword,
        addressLine: '123 rue de Paris',
        postalCode: '75000',
        city: 'Paris',
        legalStatus: 'auto-entrepreneur',
        siret: '12345678900011',
      },
    });

    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sarah@example.com', password: 'Password123!' })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    token = res.body.access_token;
  });

  it('POST /auth/register', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'Test1234!',
        addressLine: '1 place de la République',
        postalCode: '75011',
        city: 'Paris',
        legalStatus: 'SARL',
        siret: '98765432100022',
      })
      .expect(201);
  });

  it('POST /auth/2fa/verify - invalid token', async () => {
    await prisma.user.update({ where: { id: userId }, data: {
      isTwoFactorEnabled: true,
      twoFactorSecret: 'ABCDEF1234567890',
    }});

    await request(app.getHttpServer())
      .post('/auth/2fa/verify')
      .send({ userId, token: '000000' })
      .expect(401);
  });

  it('POST /auth/request-reset-password', async () => {
    await request(app.getHttpServer())
      .post('/auth/request-reset-password')
      .send({ email: 'sarah@example.com' })
      .expect(201);
  });

  it('POST /auth/reset-password', async () => {
    await prisma.user.update({
      where: { email: 'sarah@example.com' },
      data: { resetPasswordToken: 'resettoken', resetPasswordTokenExpiry: new Date(Date.now() + 60 * 1000) },
    });

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'resettoken', newPassword: 'NewPass123!' })
      .expect(201);
  });

  it('GET /auth/reset-password/validate', async () => {
    await prisma.user.update({
      where: { email: 'sarah@example.com' },
      data: { resetPasswordToken: 'token123', resetPasswordTokenExpiry: new Date(Date.now() + 60 * 1000) },
    });

    await request(app.getHttpServer())
      .get('/auth/reset-password/validate')
      .query({ token: 'token123' })
      .expect(200);
  });

  it('GET /auth/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('email');
  });

  it('GET /auth/is-authenticated', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/is-authenticated')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBe(true);
  });
});
