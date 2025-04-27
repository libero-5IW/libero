import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une facture à partir d’un template' })
  @ApiResponse({ status: 201, description: 'Facture créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Erreur de validation des données.' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return await this.invoiceService.createInvoiceFromTemplate(createInvoiceDto, createInvoiceDto.userId);
  }

  @Get('next-number')
  @ApiOperation({ summary: 'Obtenir le prochain numéro de facture' })
  async getNextInvoiceNumber() {
    return await this.invoiceService.getNextInvoiceNumber();
  }  

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une facture par son ID' })
  @ApiResponse({ status: 200, description: 'Facture trouvée.' })
  @ApiResponse({ status: 404, description: 'Facture non trouvée.' })
  async getInvoiceById(@Param('id') id: string) {
    const invoice = await this.invoiceService.findById(id);
    if (!invoice) {
      throw new NotFoundException('Facture non trouvée');
    }
    return invoice;
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les factures' })
  async getAllInvoices() {
    return await this.invoiceService.findAll();
  }


}
