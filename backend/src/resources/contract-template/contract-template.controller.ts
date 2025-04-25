import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe'; 
import { DEFAULT_CONTRACT_TEMPLATE } from 'src/common/constants/system-templates/defaultContractTemplate';

@Controller('contract-templates')
export class ContractTemplateController {
  constructor(private readonly contractTemplateService: ContractTemplateService) {}

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_CONTRACT_TEMPLATE;
  }

  @Post()
  create(
    @Body(new ValidateTemplateVariablesPipe())
    createContractTemplateDto: CreateContractTemplateDto,
  ) {
    return this.contractTemplateService.create(createContractTemplateDto);
  }

  @Get()
  findAll() {
    return this.contractTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractTemplateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateContractTemplateDto: UpdateContractTemplateDto,
  ) {
    return this.contractTemplateService.update(id, updateContractTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractTemplateService.remove(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.contractTemplateService.duplicate(id);
  }
}
