import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ContractTemplateVariableEntity } from './contract-template-variable.entity';

export class ContractTemplateEntity {
  @ApiProperty({ example: 'd8cf1d4a-9fa4-4560-b77f-15439a001f5b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Modèle de contrat pour prestation web' })
  @Expose()
  name: string;

  @ApiProperty({
    example:
      '<p>Bonjour {{client_name}}, voici votre contrat pour {{prestation}}...</p>',
  })
  @Expose()
  contentHtml: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: () => [ContractTemplateVariableEntity] })
  @Expose()
  @Type(() => ContractTemplateVariableEntity)
  variables: ContractTemplateVariableEntity[];

  @ApiProperty({ example: '2025-03-26T15:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-03-27T10:45:00Z' })
  @Expose()
  updatedAt: Date;
}
