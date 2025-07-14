import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('InvoiceTemplateController (functional)', () => {
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
    await prisma.invoiceTemplate.deleteMany({});
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'Invoice',
        lastName: 'TemplateTester',
        email: 'invoice-template@example.com',
        password,
        addressLine: '6 rue template',
        postalCode: '75006',
        city: 'Paris',
        legalStatus: 'SASU',
        siret: '44444444400044'
      }
    });

    userId = user.id;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invoice-template@example.com', password: 'Password123!' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /invoice-templates/default-template', async () => {
    await request(app.getHttpServer())
      .get('/invoice-templates/default-template')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('POST /invoice-templates', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoice-templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Invoice Template',
        contentHtml: '<p>Template</p>',
        pdfKey: 'template.pdf',
        previewKey: 'preview.png',
        variables: [
          {
            variableName: 'total',
            label: 'Total',
            type: 'string',
            required: true
          }
        ]
      })
      .expect(201);

    templateId = res.body.id;
  });

  it('GET /invoice-templates', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoice-templates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /invoice-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/invoice-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', templateId);
  });

  it('PATCH /invoice-templates/:id', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/invoice-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Invoice Template',
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

    expect(res.body.name).toBe('Updated Invoice Template');
  });

  it('GET /invoice-templates/search', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoice-templates/search')
      .query({ term: 'Updated' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /invoice-templates/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoice-templates/export')
      .query({ term: '' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('POST /invoice-templates/:id/duplicate', async () => {
    const res = await request(app.getHttpServer())
      .post(`/invoice-templates/${templateId}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.id).not.toBe(templateId);
  });

  it('DELETE /invoice-templates/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/invoice-templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
