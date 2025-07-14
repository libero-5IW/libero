import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('ContractController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let contractId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.contract.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Contract',
        lastName: 'Tester',
        email: 'contractuser@example.com',
        password,
        addressLine: '5 rue contrat',
        postalCode: '75005',
        city: 'Paris',
        legalStatus: 'SARL',
        siret: '22222222200022'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'contractuser@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /contracts', async () => {
    const res = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        number: 1,
        contentHtml: '<p>Contrat</p>',
        pdfKey: 'contract.pdf',
        previewKey: 'preview.png',
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        variableValues: [
          {
            variableName: 'nom',
            label: 'Nom',
            type: 'string',
            required: true,
            value: 'Exemple'
          }
        ]
      })
      .expect(201);

    contractId = res.body.id;
  });

  it('GET /contracts', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /contracts/next-number', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/next-number')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(typeof res.body).toBe('number');
  });

  it('GET /contracts/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/search')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /contracts/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('GET /contracts/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', contractId);
  });

  it('PUT /contracts/:id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
        variableValues: [
          {
            variableName: 'nom',
            label: 'Nom',
            type: 'string',
            required: true,
            value: 'Modifié'
          }
        ]
      })
      .expect(200);

    expect(res.body.variableValues[0].value).toBe('Modifié');
  });

  it('PATCH /contracts/:id/signature', async () => {
    await request(app.getHttpServer())
      .patch(`/contracts/${contractId}/signature`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('PATCH /contracts/:id/send-signed', async () => {
    await request(app.getHttpServer())
      .patch(`/contracts/${contractId}/send-signed`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('DELETE /contracts/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});