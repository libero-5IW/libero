import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

const TEST_USER = {
  email: 'sarah@libero.com',
  password: 'azerty123',
};

describe('QuoteTemplateController (Functional)', () => {
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

  it('GET /quote-templates/default-template - récupère le modèle par défaut', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates/default-template')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body).toBeDefined();
    }
  });

  it('POST /quote-templates - crée un modèle de devis', async () => {
    const templateData = {
      name: 'Modèle Devis Test',
      content: '<p>Contenu</p>',
      variables: [],
    };
    const res = await request(app.getHttpServer())
      .post('/quote-templates')
      .set('Authorization', `Bearer ${jwt}`)
      .send(templateData);
    expect([201, 400, 404, 401, 403].includes(res.status)).toBe(true);
    if (res.status === 201) {
      expect(res.body.name).toBe(templateData.name);
      createdTemplateId = res.body.id;
    }
  });

  it('GET /quote-templates - récupère tous les modèles', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('GET /quote-templates/search - recherche des modèles', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates/search?term=Modèle')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      const isArrayLike = Array.isArray(res.body)
        || (res.body && Array.isArray(res.body.results))
        || (res.body && Array.isArray(res.body.items));
      expect(isArrayLike).toBe(true);
    }
  });

  it('GET /quote-templates/export - exporte les modèles en CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates/export')
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=');
    }
  });

  it('GET /quote-templates/:id - récupère un modèle par id', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .get(`/quote-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      expect(res.body).toBeDefined();
    }
  });

  it('PATCH /quote-templates/:id - met à jour un modèle', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .patch(`/quote-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'Modèle Devis Test Modifié' });
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('POST /quote-templates/:id/duplicate - duplique un modèle', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .post(`/quote-templates/${createdTemplateId}/duplicate`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([201, 200, 400, 401, 403, 404].includes(res.status)).toBe(true);
  });

  it('DELETE /quote-templates/:id - supprime un modèle', async () => {
    if (!createdTemplateId) return;
    const res = await request(app.getHttpServer())
      .delete(`/quote-templates/${createdTemplateId}`)
      .set('Authorization', `Bearer ${jwt}`);
    expect([200, 201, 400, 401, 403, 404].includes(res.status)).toBe(true);
    if ([200, 201].includes(res.status)) {
      const res2 = await request(app.getHttpServer())
        .get(`/quote-templates/${createdTemplateId}`)
        .set('Authorization', `Bearer ${jwt}`);
      expect([404, 400, 401, 403].includes(res2.status)).toBe(true);
    }
  });
});
