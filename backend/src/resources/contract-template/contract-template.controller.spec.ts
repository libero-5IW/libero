import { Test, TestingModule } from '@nestjs/testing';
import { ContractTemplateController } from './contract-template.controller';
import { ContractTemplateService } from './contract-template.service';

describe('ContractTemplateController', () => {
  let controller: ContractTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractTemplateController],
      providers: [ContractTemplateService],
    }).compile();

    controller = module.get<ContractTemplateController>(ContractTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
