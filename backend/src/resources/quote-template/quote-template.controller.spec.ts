import { Test, TestingModule } from '@nestjs/testing';
import { QuoteTemplateController } from './quote-template.controller';
import { QuoteTemplateService } from './quote-template.service';

describe('QuoteTemplateController', () => {
  let controller: QuoteTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteTemplateController],
      providers: [QuoteTemplateService],
    }).compile();

    controller = module.get<QuoteTemplateController>(QuoteTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
