import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTemplateController } from './invoice-template.controller';
import { InvoiceTemplateService } from './invoice-template.service';

describe('InvoiceTemplateController', () => {
  let controller: InvoiceTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceTemplateController],
      providers: [InvoiceTemplateService],
    }).compile();

    controller = module.get<InvoiceTemplateController>(InvoiceTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
