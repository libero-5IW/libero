import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { VariableType } from 'src/common/enums/variable-type.enum';

export class QuoteTemplateVariableEntity {
  @ApiProperty({ example: 'f21796d5-e7e4-4d5c-8f47-48f6d7c4457b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'd8cf1d4a-9fa4-4560-b77f-15439a001f5b' })
  @Expose()
  templateId: string;

  @ApiProperty({ example: 'number_of_pages' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Nombre de pages' })
  @Expose()
  label: string;

  @ApiProperty({
    enum: VariableType,
    example: VariableType.STRING,
    description:
      'Type de la variable : string, number, boolean, date, textarea, email, url',
  })
  @Expose()
  type: string;

  @ApiProperty({ example: false })
  @Expose()
  required: boolean;
}
