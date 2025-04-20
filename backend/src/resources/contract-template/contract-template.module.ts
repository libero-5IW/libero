import { Module } from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { ContractTemplateController } from './contract-template.controller';

@Module({
  controllers: [ContractTemplateController],
  providers: [ContractTemplateService],
})
export class ContractTemplateModule {}
