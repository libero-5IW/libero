import { Test, TestingModule } from '@nestjs/testing';
import { QuoteTemplateService } from './quote-template.service';

describe('QuoteTemplateService', () => {
  let service: QuoteTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteTemplateService],
    }).compile();

    service = module.get<QuoteTemplateService>(QuoteTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
