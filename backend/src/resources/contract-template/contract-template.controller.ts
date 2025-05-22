import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';

@ApiBearerAuth()
@Controller('contract-templates')
export class ContractTemplateController {
  constructor(
    private readonly contractTemplateService: ContractTemplateService,
  ) {}

  @Get('default-template')
  getDefaultTemplate() {
    return this.contractTemplateService.getDefaultTemplate();
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe(new PrismaService()))
    createContractTemplateDto: CreateContractTemplateDto,
  ) {
    return this.contractTemplateService.create(
      user.userId,
      createContractTemplateDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('includeDefault') includeDefault: string,
  ) {
    const include = includeDefault !== 'false';
    return this.contractTemplateService.findAll(user.userId, include);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.contractTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body()
    updateContractTemplateDto: UpdateContractTemplateDto,
  ) {
    const pipe = new ValidateTemplateVariablesPipe(new PrismaService());
    await pipe.transform({
      ...updateContractTemplateDto,
      id,
    });

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
