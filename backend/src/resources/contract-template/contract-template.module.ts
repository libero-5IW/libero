import { Module } from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { ContractTemplateController } from './contract-template.controller';
import { UserService } from '../user/user.service'; 

@Module({
  controllers: [ContractTemplateController],
  providers: [ContractTemplateService, UserService], 
})
export class ContractTemplateModule {}
