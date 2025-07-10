import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Res, 
  Query
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createClientDto: CreateClientDto,
  ) {
    return this.clientService.create(user.userId, createClientDto);
  }

  @Get('export')
  exportClients(
    @CurrentUser() user: JwtPayload,
    @Query('term') term: string,
    @Res() res: Response,
  ) {
    return this.clientService.exportToCSV(user.userId, term).then(({ content, filename }) => {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(content);
    });
  }  

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.clientService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, user.userId, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientService.remove(id, user.userId);
  }

  @Get('search/:term')
  search(@Param('term') term: string, @CurrentUser() user: JwtPayload) {
    return this.clientService.search(user.userId, term);
  }
}
