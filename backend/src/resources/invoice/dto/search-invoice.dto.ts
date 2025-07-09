import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsInt,
    Min,
  } from 'class-validator';
  import { InvoiceStatus } from '@prisma/client';
  import { Type } from 'class-transformer';
  
  export class SearchInvoiceDto {
    @IsOptional()
    @IsString()
    term?: string;
  
    @IsOptional()
    @IsEnum(InvoiceStatus)
    status?: InvoiceStatus;
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsDateString()
    endDate?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number;
  }
  