import { Test, TestingModule } from '@nestjs/testing';
import { ContractTemplateService } from './contract-template.service';

describe('ContractTemplateService', () => {
  let service: ContractTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractTemplateService],
    }).compile();

    service = module.get<ContractTemplateService>(ContractTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
