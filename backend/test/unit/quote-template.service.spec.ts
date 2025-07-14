import { Test, TestingModule } from '@nestjs/testing';
import { QuoteTemplateService } from 'src/resources/quote-template/quote-template.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockTemplate = {
  id: 'template-id',
  name: 'Devis A',
  contentHtml: '<p>Devis</p>',
  pdfKey: 'pdf-key',
  previewKey: 'preview-key',
  userId: 'user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [
    { variableName: 'prix', label: 'Prix', type: 'number', required: true },
  ],
};

describe('QuoteTemplateService', () => {
  let service: QuoteTemplateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteTemplateService,
        {
          provide: PrismaService,
          useValue: {
            quoteTemplate: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            quoteTemplateVariable: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb({
              quoteTemplate: {
                update: jest.fn().mockResolvedValue(mockTemplate),
              },
              quoteTemplateVariable: {
                deleteMany: jest.fn(),
                createMany: jest.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get<QuoteTemplateService>(QuoteTemplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a quote template', async () => {
    jest.spyOn(prisma.quoteTemplate, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.quoteTemplate, 'create').mockResolvedValue(mockTemplate);
    const result = await service.create('user-id', {
      name: 'Devis A',
      contentHtml: '<p>Devis</p>',
      variables: [
        { variableName: 'prix', label: 'Prix', type: 'number', required: true },
      ],
    });
    expect(result.name).toBe('Devis A');
  });

  it('should throw if template with same name exists', async () => {
    jest.spyOn(prisma.quoteTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    await expect(
      service.create('user-id', {
        name: 'Devis A',
        contentHtml: '<p>Test</p>',
        variables: [],
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('should update a quote template', async () => {
    jest.spyOn(prisma.quoteTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    const result = await service.update('template-id', 'user-id', {
      name: 'Devis A',
      contentHtml: '<p>Updated</p>',
      variables: [],
    });
    expect(result.id).toBe('template-id');
  });

  it('should remove a quote template', async () => {
    jest.spyOn(prisma.quoteTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    jest.spyOn(prisma.quoteTemplate, 'delete').mockResolvedValue(mockTemplate);
    const result = await service.remove('template-id', 'user-id');
    expect(result.id).toBe('template-id');
  });

  it('should throw on not found in findOne', async () => {
    jest.spyOn(prisma.quoteTemplate, 'findFirst').mockResolvedValue(null);
    await expect(service.findOne('x', 'user-id')).rejects.toThrow(NotFoundException);
  });
});