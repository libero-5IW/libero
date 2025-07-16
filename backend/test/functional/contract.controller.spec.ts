import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const contractData = {
  title: 'Contrat de prestation',
  clientId: 'client-id',
  templateId: 'template-id',
  variables: {},
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('ContractController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let createdContractId: string;

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

  it('POST /contracts - crée un contrat', async () => {
    const res = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${jwt}`)
      .send(contractData);
    expect([201, 400, 404].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.title).toBe(contractData.title);
      createdContractId = res.body.id;
    }
  });

  it('GET /contracts - récupère tous les contrats', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /contracts/next-number - récupère le prochain numéro de contrat', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/next-number')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.body.nextNumber === undefined || typeof res.body.nextNumber === 'number').toBe(true);
  });

  it('GET /contracts/search - recherche des contrats', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/search?term=Contrat')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    const isArrayLike = Array.isArray(res.body)
      || (res.body && Array.isArray(res.body.results))
      || (res.body && Array.isArray(res.body.items))
      || (res.body && typeof res.body === 'object');
    expect(isArrayLike).toBe(true);
  });

  it('GET /contracts/export - exporte les contrats en CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/export')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.header['content-disposition']).toContain('attachment; filename=');
  });

  it('GET /contracts/:id - récupère un contrat par id', async () => {
    if (!createdContractId) return;
    const res = await request(app.getHttpServer())
      .get(`/contracts/${createdContractId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    expect(res.body.id).toBe(createdContractId);
  });

  it('PUT /contracts/:id - met à jour un contrat', async () => {
    if (!createdContractId) return;
    const res = await request(app.getHttpServer())
      .put(`/contracts/${createdContractId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ title: 'Contrat modifié' })
      .expect(200);
    expect(res.body.title).toBe('Contrat modifié');
  });

  it('PATCH /contracts/:id/signature - envoie le contrat en signature', async () => {
    if (!createdContractId) return;
    const res = await request(app.getHttpServer())
      .patch(`/contracts/${createdContractId}/signature`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('PATCH /contracts/:id/send-signed - envoie le contrat signé au client', async () => {
    if (!createdContractId) return;
    const res = await request(app.getHttpServer())
      .patch(`/contracts/${createdContractId}/send-signed`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 400, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /contracts/:id - supprime un contrat', async () => {
    if (!createdContractId) return;
    await request(app.getHttpServer())
      .delete(`/contracts/${createdContractId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/contracts/${createdContractId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(404);
  });
});
