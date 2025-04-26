import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InvoiceTemplateController } from '../../src/resources/invoice-template/invoice-template.controller';
import { InvoiceTemplateService } from '../../src/resources/invoice-template/invoice-template.service';
import { DEFAULT_INVOICE_TEMPLATE } from '../../src/common/constants/system-templates/defaultInvoiceTemplate';

describe('InvoiceTemplateController (Functional)', () => {
  let app: INestApplication;

  const requiredContentHtml = `
    <h1>Facture n°{{invoice_number}}</h1>
    <p>Émise le : {{issue_date}}</p>
    <p>Échéance : {{due_date}}</p>
    <p>Freelance : {{freelancer_name}}, {{freelancer_address}}</p>
    <p>SIRET : {{freelancer_siret}}</p>
    <p>Client : {{client_name}}, {{client_address}}</p>
    <p>Prestation : {{prestation_description}}</p>
    <p>Montant HT : {{total_amount}}</p>
    <p>Conditions de paiement : {{payment_terms}}</p>
    <p>Pénalités de retard : {{late_penalty}}</p>
    <p>Détail TVA : {{tva_detail}}</p>
  `.trim();

  const mockTemplate = {
    id: '1',
    name: 'Test Invoice Template',
    contentHtml: requiredContentHtml,
    userId: '123',
    variables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInvoiceTemplateService = {
    create: jest.fn(async (dto) => ({
      id: '2',
      name: dto.name,
      contentHtml: dto.contentHtml,
      userId: dto.userId || '123',
      variables: dto.variables || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    findAll: jest.fn().mockResolvedValue([mockTemplate]),
    findOne: jest.fn().mockResolvedValue(mockTemplate),
    update: jest.fn(async (id, dto) => ({
      ...mockTemplate,
      id,
      name: dto.name || mockTemplate.name,
      contentHtml: dto.contentHtml || mockTemplate.contentHtml,
    })),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
    duplicate: jest.fn().mockResolvedValue({
      id: '3',
      name: 'Test Invoice Template Copy',
      contentHtml: requiredContentHtml,
      userId: 'mock-user-id',
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceTemplateController],
      providers: [
        {
          provide: InvoiceTemplateService,
          useValue: mockInvoiceTemplateService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET invoice-templates/default-template', () => {
    return request(app.getHttpServer())
      .get('/invoice-templates/default-template')
      .expect(200)
      .expect(DEFAULT_INVOICE_TEMPLATE);
  });

  it('/POST invoice-templates', () => {
    return request(app.getHttpServer())
      .post('/invoice-templates')
      .send({
        name: 'New Invoice Template',
        contentHtml: requiredContentHtml,
        userId: '123',
        variables: [],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '2',
          name: 'New Invoice Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/GET invoice-templates', () => {
    return request(app.getHttpServer())
      .get('/invoice-templates')
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toMatchObject({
          id: '1',
          name: 'Test Invoice Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body[0].createdAt).toBe('string');
        expect(typeof res.body[0].updatedAt).toBe('string');
      });
  });

  it('/GET invoice-templates/:id', () => {
    return request(app.getHttpServer())
      .get('/invoice-templates/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Test Invoice Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/PATCH invoice-templates/:id', () => {
    return request(app.getHttpServer())
      .patch('/invoice-templates/1')
      .send({ name: 'Updated Invoice Template', contentHtml: requiredContentHtml })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Updated Invoice Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/DELETE invoice-templates/:id', () => {
    return request(app.getHttpServer())
      .delete('/invoice-templates/1')
      .expect(200)
      .expect({ deleted: true });
  });

  it('/POST invoice-templates/:id/duplicate', () => {
    return request(app.getHttpServer())
      .post('/invoice-templates/1/duplicate')
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '3',
          name: 'Test Invoice Template Copy',
          contentHtml: requiredContentHtml,
          userId: 'mock-user-id',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });
});
