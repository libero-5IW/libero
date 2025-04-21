import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTemplateService } from './invoice-template.service';

describe('InvoiceTemplateService', () => {
  let service: InvoiceTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceTemplateService],
    }).compile();

    service = module.get<InvoiceTemplateService>(InvoiceTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
