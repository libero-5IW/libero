import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ContractTemplateController } from '../../src/resources/contract-template/contract-template.controller';
import { ContractTemplateService } from '../../src/resources/contract-template/contract-template.service';
import { DEFAULT_CONTRACT_TEMPLATE } from '../../src/common/constants/system-templates/defaultContractTemplate';

describe('ContractTemplateController (Functional)', () => {
  let app: INestApplication;

  const requiredContentHtml = `
    <h1>Contrat de prestation</h1>
    <p><strong>Freelance :</strong> {{freelancer_name}}, {{freelancer_address}}</p>
    <p><strong>Client :</strong> {{client_name}}, {{client_address}}</p>
    <p><strong>Prestation :</strong> {{prestation_description}}</p>
    <p><strong>Montant :</strong> {{total_amount}} € HT</p>
    <p><strong>Modalités de paiement :</strong> {{payment_terms}}</p>
    <p><strong>Signature Freelance :</strong> {{freelancer_signature}}</p>
    <p><strong>Signature Client :</strong> {{client_signature}}</p>
  `.trim();

  const mockTemplate = {
    id: '1',
    name: 'Test Contract Template',
    contentHtml: requiredContentHtml,
    userId: '123',
    variables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockContractTemplateService = {
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
      name: 'Test Contract Template Copy',
      contentHtml: requiredContentHtml,
      userId: 'mock-user-id',
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ContractTemplateController],
      providers: [
        {
          provide: ContractTemplateService,
          useValue: mockContractTemplateService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET contract-templates/default-template', () => {
    return request(app.getHttpServer())
      .get('/contract-templates/default-template')
      .expect(200)
      .expect(DEFAULT_CONTRACT_TEMPLATE);
  });

  it('/POST contract-templates', () => {
    return request(app.getHttpServer())
      .post('/contract-templates')
      .send({
        name: 'New Contract Template',
        contentHtml: requiredContentHtml,
        userId: '123',
        variables: [],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '2',
          name: 'New Contract Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/GET contract-templates', () => {
    return request(app.getHttpServer())
      .get('/contract-templates')
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toMatchObject({
          id: '1',
          name: 'Test Contract Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body[0].createdAt).toBe('string');
        expect(typeof res.body[0].updatedAt).toBe('string');
      });
  });

  it('/GET contract-templates/:id', () => {
    return request(app.getHttpServer())
      .get('/contract-templates/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Test Contract Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/PATCH contract-templates/:id', () => {
    return request(app.getHttpServer())
      .patch('/contract-templates/1')
      .send({ name: 'Updated Contract Template', contentHtml: requiredContentHtml })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          name: 'Updated Contract Template',
          contentHtml: requiredContentHtml,
          userId: '123',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });

  it('/DELETE contract-templates/:id', () => {
    return request(app.getHttpServer())
      .delete('/contract-templates/1')
      .expect(200)
      .expect({ deleted: true });
  });

  it('/POST contract-templates/:id/duplicate', () => {
    return request(app.getHttpServer())
      .post('/contract-templates/1/duplicate')
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '3',
          name: 'Test Contract Template Copy',
          contentHtml: requiredContentHtml,
          userId: 'mock-user-id',
          variables: [],
        });
        expect(typeof res.body.createdAt).toBe('string');
        expect(typeof res.body.updatedAt).toBe('string');
      });
  });
});
