import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('QuoteTemplateController (functional)', () => {
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
    await prisma.quoteTemplate.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Quote',
        lastName: 'TemplateTester',
        email: 'quote-template@example.com',
        password,
        addressLine: '7 rue devis',
        postalCode: '75007',
        city: 'Paris',
        legalStatus: 'EURL',
        siret: '55555555500055'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'quote-template@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /quote-templates/default-template', async () => {
    await request(app.getHttpServer())
      .get('/quote-templates/default-template')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('POST /quote-templates', async () => {
    const res = await request(app.getHttpServer())
      .post('/quote-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Quote Template',
        contentHtml: '<p>Template</p>',
        pdfKey: 'quote.pdf',
        previewKey: 'preview.png',
        variables: [
          {
            variableName: 'clientName',
            label: 'Nom Client',
            type: 'string',
            required: true
          }
        ]
      })
      .expect(201);

    templateId = res.body.id;
  });

  it('GET /quote-templates', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /quote-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/quote-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', templateId);
  });

  it('PATCH /quote-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/quote-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Quote Template',
        contentHtml: '<p>Updated</p>',
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

    expect(res.body.name).toBe('Updated Quote Template');
  });

  it('GET /quote-templates/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates/search')
      .query({ term: 'Updated' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /quote-templates/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/quote-templates/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('POST /quote-templates/:id/duplicate', async () => {
    const res = await request(app.getHttpServer())
      .post(`/quote-templates/${templateId}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.id).not.toBe(templateId);
  });

  it('DELETE /quote-templates/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/quote-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
