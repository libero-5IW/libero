import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from 'src/resources/quote/quote.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ClientService } from 'src/resources/client/client.service';
import { QuoteTemplateService } from 'src/resources/quote-template/quote-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { QuoteStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockQuote = {
  id: 'quote-id',
  number: 1,
  templateId: 'template-id',
  userId: 'user-id',
  clientId: 'client-id',
  status: QuoteStatus.draft,
  generatedHtml: '<p>HTML</p>',
  issuedAt: new Date(),
  validUntil: new Date(),
  pdfKey: 'pdf-key',
  previewKey: 'preview-key',
  createdAt: new Date(),
  updatedAt: new Date(),
  variableValues: [
    {
      variableName: 'client_name',
      label: 'Nom',
      type: 'string',
      required: true,
      value: 'Jean Dupont',
    },
  ],
};

describe('QuoteService', () => {
  let service: QuoteService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        {
          provide: PrismaService,
          useValue: {
            quote: {
              create: jest.fn().mockResolvedValue(mockQuote),
              findFirst: jest.fn().mockResolvedValue(mockQuote),
              findUnique: jest.fn().mockResolvedValue(mockQuote),
              update: jest.fn().mockResolvedValue(mockQuote),
              delete: jest.fn().mockResolvedValue(mockQuote),
              findMany: jest.fn().mockResolvedValue([mockQuote]),
              count: jest.fn().mockResolvedValue(1),
            },
            quoteVariableValue: {
              update: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb({
              quote: {
                findMany: jest.fn().mockResolvedValue([mockQuote]),
                count: jest.fn().mockResolvedValue(1),
              },
            })),
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
            getClientOrThrow: jest.fn().mockResolvedValue({ id: 'client-id', email: 'client@example.com' }),
          },
        },
        {
          provide: QuoteTemplateService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 'template-id', variables: [] }),
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
            generateSignedUrl: jest.fn().mockResolvedValue('signed-url'),
            deleteFile: jest.fn(),
            getFileBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendQuoteByEmail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a quote', async () => {
    const result = await service.create('user-id', {
      userId: 'user-id',
      templateId: 'template-id',
      clientId: 'client-id',
      generatedHtml: '<p>quote</p>',
      validUntil: new Date(),
      variableValues: [],
    });
    expect(result.id).toBe('quote-id');
  });

  it('should find one quote', async () => {
    const result = await service.findOne('quote-id', 'user-id');
    expect(result.id).toBe('quote-id');
  });

  it('should throw on not found', async () => {
    jest.spyOn(prisma.quote, 'findFirst').mockResolvedValueOnce(null);
    await expect(service.findOne('x', 'user-id')).rejects.toThrow(NotFoundException);
  });

  it('should update a draft quote', async () => {
    const result = await service.update('quote-id', 'user-id', {
      generatedHtml: '<p>new</p>',
      variableValues: [],
    });
    expect(result.id).toBe('quote-id');
  });

  it('should delete a quote', async () => {
    const result = await service.remove('quote-id', 'user-id');
    expect(result.id).toBe('quote-id');
  });

  it('should change status', async () => {
    const result = await service.changeStatus('quote-id', 'user-id', QuoteStatus.sent);
    expect(result.status).toBe(QuoteStatus.draft);
  });

  it('should throw on invalid status change', async () => {
    await expect(service.changeStatus('quote-id', 'user-id', QuoteStatus.draft)).resolves.toBeTruthy();
    await expect(service.changeStatus('quote-id', 'user-id', 'paid' as QuoteStatus)).rejects.toThrow(BadRequestException);
  });

  it('should throw ForbiddenException in getPreviewSignedUrl if not owner', async () => {
    jest.spyOn(prisma.quote, 'findUnique').mockResolvedValueOnce({ ...mockQuote, userId: 'other-user' });
    await expect(service.getPreviewSignedUrl('quote-id', 'user-id')).rejects.toThrow(ForbiddenException);
  });
});
