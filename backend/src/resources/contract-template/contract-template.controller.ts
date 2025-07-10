import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res
} from '@nestjs/common';
import { ContractTemplateService } from './contract-template.service';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SearchContractTemplateDto } from './dto/search-contract-template.dto';
import { Response } from 'express';

@ApiBearerAuth()
@Controller('contract-templates')
export class ContractTemplateController {
  constructor(private readonly contractTemplateService: ContractTemplateService) {}

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

  @Get('search')
  search(
    @Query() query: SearchContractTemplateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const {
      term = '',
      startDate,
      endDate,
      page,
      pageSize,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    const parsedPage = page ? parseInt(String(page), 10) : undefined;
    const parsedPageSize = pageSize ? parseInt(String(pageSize), 10) : undefined;
  
    return this.contractTemplateService.search(
      user.userId,
      term,
      parsedStart,
      parsedEnd,
      parsedPage,
      parsedPageSize,
    );
  }  

  @Get('export')
  exportTemplates(
    @Query() query: SearchContractTemplateDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const {
      term = '',
      startDate,
      endDate,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    return this.contractTemplateService.exportToCSV(
      user.userId,
      term,
      parsedStart,
      parsedEnd
    ).then(({ content, filename }) => {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(content);
    });
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
