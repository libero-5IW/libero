import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsInt,
    Min,
  } from 'class-validator';
  import { QuoteStatus } from '@prisma/client';
  import { Type } from 'class-transformer';
  
  export class SearchQuoteDto {
    @IsOptional()
    @IsString()
    term?: string;
  
    @IsOptional()
    @IsEnum(QuoteStatus)
    status?: QuoteStatus;
  
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
  