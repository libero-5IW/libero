import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Res
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateContractOnCreatePipe } from './pipes/create-validate-contract-variables.pipe';
import { ValidateContractOnUpdatePipe } from './pipes/update-validate-contract.pipe';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ContractStatus } from '@prisma/client';
import { SearchContractDto } from './dto/search-contract.dto';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateContractOnCreatePipe(new PrismaService()))
    createContractDto: CreateContractDto,
  ) {
    return this.contractService.create(user.userId, createContractDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.contractService.findAll(user.userId);
  }

  @Get('next-number')
  getNextContractNumber(@CurrentUser() user: JwtPayload) {
    return this.contractService.getNextContractNumber(user.userId);
  }

  @Get('search')
  searchContracts(
    @Query() query: SearchContractDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const {
      term = '',
      status,
      startDate,
      endDate,
      page,
      pageSize,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    const parsedPage = page ? parseInt(String(page), 10) : undefined;
    const parsedPageSize = pageSize ? parseInt(String(pageSize), 10) : undefined;
  
    return this.contractService.search(
      user.userId,
      term,
      status,
      parsedStart,
      parsedEnd,
      parsedPage,
      parsedPageSize,
    );
  }   

  @Get('export')
  exportContracts(
    @Query() query: SearchContractDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const {
      term = '',
      status,
      startDate,
      endDate,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    return this.contractService
      .exportToCSV(user.userId, term, status, parsedStart, parsedEnd)
      .then(({ content, filename }) => {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.end(content);
      });
  }  

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contractService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateContractOnUpdatePipe())
    updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, user.userId, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contractService.remove(id, user.userId);
  }

}
