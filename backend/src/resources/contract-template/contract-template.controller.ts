import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';

@Controller('contract-template')
export class ContractTemplateController {
  constructor(private readonly contractTemplateService: ContractTemplateService) {}

  @Post()
  create(@Body() createContractTemplateDto: CreateContractTemplateDto) {
    return this.contractTemplateService.create(createContractTemplateDto);
  }

  @Get()
  findAll() {
    return this.contractTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractTemplateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractTemplateDto: UpdateContractTemplateDto) {
    return this.contractTemplateService.update(+id, updateContractTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractTemplateService.remove(+id);
  }
}
