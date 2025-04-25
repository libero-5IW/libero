import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ContractTemplateVariableEntity {
  @ApiProperty({ example: 'f21796d5-e7e4-4d5c-8f47-48f6d7c4457b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'd8cf1d4a-9fa4-4560-b77f-15439a001f5b' })
  @Expose()
  templateId: string;

  @ApiProperty({ example: 'mission_title' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Titre de la mission' })
  @Expose()
  label: string;

  @ApiProperty({ example: 'string' })
  @Expose()
  type: string;

  @ApiProperty({ example: true })
  @Expose()
  required: boolean;
}
