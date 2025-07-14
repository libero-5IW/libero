import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('ContractTemplateController (functional)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let templateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.contractTemplate.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Contract',
        lastName: 'Tester',
        email: 'contract@example.com',
        password,
        addressLine: '4 rue contrat',
        postalCode: '75004',
        city: 'Paris',
        legalStatus: 'SAS',
        siret: '12345678900033'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'contract@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /contract-templates/default-template', async () => {
    await request(app.getHttpServer())
      .get('/contract-templates/default-template')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('POST /contract-templates', async () => {
    const res = await request(app.getHttpServer())
      .post('/contract-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Contract',
        contentHtml: '<p>Hello Contract</p>',
        pdfKey: 'contract.pdf',
        previewKey: 'preview.png',
        variables: [
          {
            variableName: 'name',
            label: 'Nom',
            type: 'string',
            required: true
          }
        ]
      })
      .expect(201);

    templateId = res.body.id;
  });

  it('GET /contract-templates', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /contract-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/contract-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', templateId);
  });

  it('PATCH /contract-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/contract-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Contract',
        contentHtml: '<p>Updated Content</p>',
        pdfKey: 'updated.pdf',
        previewKey: 'updated.png',
        variables: [
          {
            variableName: 'updated',
            label: 'Modifié',
            type: 'string',
            required: false
          }
        ]
      })
      .expect(200);

    expect(res.body.name).toBe('Updated Contract');
  });

  it('GET /contract-templates/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates/search')
      .query({ term: 'Updated' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /contract-templates/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/contract-templates/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('POST /contract-templates/:id/duplicate', async () => {
    const res = await request(app.getHttpServer())
      .post(`/contract-templates/${templateId}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.id).not.toBe(templateId);
  });

  it('DELETE /contract-templates/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/contract-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
