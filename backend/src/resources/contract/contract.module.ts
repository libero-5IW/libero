import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { ContractTemplateService } from '../contract-template/contract-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';

@Module({
  controllers: [ContractController],
  providers: [
    ContractService,
    UserService,
    ClientService,
    ContractTemplateService,
    S3Service,
    PdfGeneratorService,
  ],
})
export class ContractModule {}
