import {
    IsOptional,
    IsString,
    IsDateString,
    IsInt,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class SearchQuoteTemplateDto {
    @IsOptional()
    @IsString()
    term?: string;
  
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
  