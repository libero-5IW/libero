import { Module } from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { ContractTemplateController } from './contract-template.controller';
import { UserService } from '../user/user.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';

@Module({
  controllers: [ContractTemplateController],
  providers: [
    ContractTemplateService,
    UserService,
    S3Service,
    PdfGeneratorService,
  ],
  exports: [ContractTemplateService],
})
export class ContractTemplateModule {}
