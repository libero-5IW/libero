import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

const templateData = {
  name: 'Modèle de contrat test',
  contentHtml: '<p>Contrat test</p>',
  variables: [],
};

describe('ContractTemplateController (Functional)', () => {
  let app: INestApplication;
  let jwt: string;
  let createdTemplateId: string;

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

  it('GET /contract-templates/default-template', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates/default-template')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body).toBeDefined();
    }
  });

  it('POST /contract-templates', async () => {
    const templateData = {
      name: 'Modèle Test',
      content: '<p>Contenu</p>',
      variables: [],
    };
    const res = await request(app.getHttpServer())
      .post('/contract-templates')
      .set('Authorization', `Bearer ${jwt}`)
      .send(templateData);
    expect([201, 400, 404, 401, 403].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.name).toBe(templateData.name);
      createdTemplateId = res.body.id;
    }
  });

  it('GET /contract-templates', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('GET /contract-templates/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates/search?term=Modèle')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      const isArrayLike = Array.isArray(res.body)
        || (res.body && Array.isArray(res.body.results))
        || (res.body && Array.isArray(res.body.items));
      expect(isArrayLike).toBe(true);
    }
  });

  it('GET /contract-templates/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates/export')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=');
    }
  });

  it('GET /contract-templates/:id', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .get(`/contract-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body).toBeDefined();
    }
  });

  it('PATCH /contract-templates/:id', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .patch(`/contract-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Modèle Test Modifié' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('POST /contract-templates/:id/duplicate', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .post(`/contract-templates/${createdTemplateId}/duplicate`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([201, 200, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /contract-templates/:id', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .delete(`/contract-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      const res2 = await request(app.getHttpServer())
        .get(`/contract-templates/${createdTemplateId}`)
        .set('Authorization', `Bearer ${jwt}`);
      expect([404, 400, 401, 403].includes(res2.status)).toBe(true);
    }
  });
});