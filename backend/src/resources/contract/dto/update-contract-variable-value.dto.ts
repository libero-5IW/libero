import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { VariableType } from 'src/common/enums/variable-type.enum';

export class UpdateContractVariableValueDto {
  @ApiProperty({ example: 'clientName' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  variableName: string;

  @ApiProperty({ example: 'Nom du client' })
  @IsString({
    message: 'Le label de la variable doit être une chaîne de caractères.',
  })
  label: string;

  @ApiProperty({ enum: VariableType, example: VariableType.STRING })
  @IsEnum(VariableType, {
    message: 'Le type de variable doit être un type valide.',
  })
  type: VariableType;

  @ApiProperty({ example: true })
  @IsBoolean({
    message: 'Le champ required doit être un booléen.',
  })
  required: boolean;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString({
    message: 'La valeur de la variable doit être une chaîne de caractères.',
  })
  value: string;
}
