import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QuoteTemplateController } from '../../src/resources/quote-template/quote-template.controller';
import { QuoteTemplateService } from '../../src/resources/quote-template/quote-template.service';
import { DEFAULT_QUOTE_TEMPLATE } from '../../src/common/constants/system-templates/defaultQuoteTemplate';

describe('QuoteTemplateController (Functional)', () => {
  let app: INestApplication;
  
  const requiredContentHtml = `
  <p>Hello {{client_name}}, here is your quote for {{prestation}}.</p>
  <p>Freelancer: {{freelancer_name}}</p>
  <p>Date: {{quote_date}}</p>
  <p>Quote Number: {{quote_number}}</p>
  <p>Total (HT): {{total_amount}}</p>
  <p>Valid Until: {{valid_until}}</p>
`.trim();


  const mockTemplate = {
    id: '1',
    name: 'Test Template',
    contentHtml: requiredContentHtml,
    userId: '123',
    variables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockQuoteTemplateService = {
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
      name: 'Test Template Copy',
      contentHtml: requiredContentHtml,
      userId: 'mock-user-id',
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [QuoteTemplateController],
      providers: [
        {
          provide: QuoteTemplateService,
          useValue: mockQuoteTemplateService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET quote-templates/default-template', () => {
    return request(app.getHttpServer())
      .get('/quote-templates/default-template')
      .expect(200)
      .expect(DEFAULT_QUOTE_TEMPLATE);
  });

  it('/POST quote-templates', () => {
    return request(app.getHttpServer())
      .post('/quote-templates')
      .send({ 
        name: 'New Template', 
        contentHtml: requiredContentHtml, 
        userId: '123',
        variables: []
      })
      .expect(201)
      .expect(res => {
        expect(res.body).toMatchObject({
          id: '2',
          name: 'New Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/GET quote-templates', () => {
    return request(app.getHttpServer())
      .get('/quote-templates')
      .expect(200)
      .expect(res => {
        expect(res.body[0]).toMatchObject({
          id: '1',
          name: 'Test Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body[0].createdAt).toBe('string');
        expect(typeof res.body[0].updatedAt).toBe('string');
      });
  });

  it('/GET quote-templates/:id', () => {
    return request(app.getHttpServer())
      .get('/quote-templates/1')
      .expect(200)
      .expect(res => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Test Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/PATCH quote-templates/:id', () => {
    return request(app.getHttpServer())
      .patch('/quote-templates/1')
      .send({ name: 'Updated Template', contentHtml: requiredContentHtml })
      .expect(200)
      .expect(res => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Updated Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/DELETE quote-templates/:id', () => {
    return request(app.getHttpServer())
      .delete('/quote-templates/1')
      .expect(200)
      .expect({ deleted: true });
  });

  it('/POST quote-templates/:id/duplicate', () => {
    return request(app.getHttpServer())
      .post('/quote-templates/1/duplicate')
      .expect(201)
      .expect(res => {
        expect(res.body).toMatchObject({
          id: '3',
          name: 'Test Template Copy',
          contentHtml: requiredContentHtml,
          userId: 'mock-user-id',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });
});
