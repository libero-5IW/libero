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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('contract-templates')
export class ContractTemplateController {
  constructor(
    private readonly contractTemplateService: ContractTemplateService,
  ) {}

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_CONTRACT_TEMPLATE;
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe())
    createContractTemplateDto: CreateContractTemplateDto,
  ) {
    return this.contractTemplateService.create(
      user.userId,
      createContractTemplateDto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.contractTemplateService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateContractTemplateDto: UpdateContractTemplateDto,
  ) {
    return this.contractTemplateService.update(
      id,
      user.userId,
      updateContractTemplateDto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractTemplateService.remove(id, user.userId);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractTemplateService.duplicate(id, user.userId);
  }
}
