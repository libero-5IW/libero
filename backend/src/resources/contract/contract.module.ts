import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { ContractTemplateService } from '../contract-template/contract-template.service';

@Module({
  controllers: [ContractController],
  providers: [ContractService, UserService, ClientService, ContractTemplateService],
})
export class ContractModule {}
