import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InvoiceController } from '../../src/resources/invoice/invoice.controller';
import { InvoiceService } from '../../src/resources/invoice/invoice.service';

describe('InvoiceController (Functional)', () => {
  let app: INestApplication;

  const mockInvoice = {
    id: '1',
    number: 12,
    clientId: 'client-123',
    userId: 'user-123',
    variables: {},
    issuedAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    generatedHtml: '<p>Facture HTML</p>',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInvoiceService = {
    createInvoiceFromTemplate: jest.fn(async (dto) => ({
      ...mockInvoice,
      ...dto,
      id: '2',
      number: 13
    })),
    getNextInvoiceNumber: jest.fn().mockResolvedValue({ nextNumber: 13 }),
    findById: jest.fn(async (id) => (id === '1' ? mockInvoice : null)),
    findAll: jest.fn().mockResolvedValue([mockInvoice]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST invoices - Créer une facture', () => {
    return request(app.getHttpServer())
      .post('/invoices')
      .send({
        templateId: 'template-123',
        clientId: 'client-123',
        userId: 'user-123',
        variables: { total_amount: 1000 },
        issuedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        generatedHtml: '<p>Facture HTML</p>',
        status: 'draft'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.number).toBe(13);
        expect(res.body.status).toBe('draft');
      });
  });

  it('/GET invoices/next-number - Prochain numéro de facture', () => {
    return request(app.getHttpServer())
      .get('/invoices/next-number')
      .expect(200)
      .expect({ nextNumber: 13 });
  });

  it('/GET invoices/:id - Récupérer une facture existante', () => {
    return request(app.getHttpServer())
      .get('/invoices/1')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('1');
        expect(res.body.number).toBe(12);
      });
  });

  it('/GET invoices/:id - Facture non trouvée', () => {
    return request(app.getHttpServer())
      .get('/invoices/999')
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('Facture non trouvée');
      });
  });

  it('/GET invoices - Lister toutes les factures', () => {
    return request(app.getHttpServer())
      .get('/invoices')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });
});
