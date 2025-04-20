import { Injectable } from '@nestjs/common';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';

@Injectable()
export class ContractTemplateService {
  create(createContractTemplateDto: CreateContractTemplateDto) {
    return 'This action adds a new contractTemplate';
  }

  findAll() {
    return `This action returns all contractTemplate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contractTemplate`;
  }

  update(id: number, updateContractTemplateDto: UpdateContractTemplateDto) {
    return `This action updates a #${id} contractTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} contractTemplate`;
  }
}
