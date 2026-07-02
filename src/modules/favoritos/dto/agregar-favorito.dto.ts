import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AgregarFavoritoDto {
  @ApiProperty({ example: 1, description: 'ID del proyecto (proyectos.id) a marcar como favorito' })
  @IsInt()
  @IsPositive()
  proyectoId: number;
}
