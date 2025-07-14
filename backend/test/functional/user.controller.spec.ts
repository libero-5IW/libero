import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('UserController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'User',
        lastName: 'Tester',
        email: 'usertest@example.com',
        password,
        addressLine: '3 rue user',
        postalCode: '75003',
        city: 'Paris',
        legalStatus: 'SAS',
        siret: '33333333300033'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'usertest@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
  });

  it('PATCH /users/me', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'Lyon' })
      .expect(200);

    expect(res.body).toHaveProperty('city', 'Lyon');
  });

  it('PATCH /users/me/password', async () => {
    await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPass456!'
      })
      .expect(200);
  });

  it('DELETE /users/me', async () => {
    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});