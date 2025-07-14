import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from 'src/resources/invoice/invoice.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ClientService } from 'src/resources/client/client.service';
import { InvoiceTemplateService } from 'src/resources/invoice-template/invoice-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { InvoiceStatus } from '@prisma/client';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            invoiceVariableValue: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb({})),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserOrThrow: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
          },
        },
        {
          provide: ClientService,
          useValue: {
            getClientOrThrow: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: InvoiceTemplateService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              variables: [],
              contentHtml: '<p>template</p>',
            }),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generatePdfAndPreview: jest.fn().mockResolvedValue({
              pdfBuffer: Buffer.from('pdf'),
              previewBuffer: Buffer.from('preview'),
            }),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadDocumentAssets: jest.fn().mockResolvedValue({
              pdfKey: 'pdf-key',
              previewKey: 'preview-key',
            }),
            generateSignedUrl: jest.fn().mockResolvedValue('url'),
            deleteFile: jest.fn(),
            getFileBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendInvoiceToPayEmail: jest.fn(),
            sendInvoicePaidEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
