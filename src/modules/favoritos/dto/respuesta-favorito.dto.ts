import { ApiProperty } from '@nestjs/swagger';

export class RespuestaFavoritoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  proyectoId: number;

  @ApiProperty({ example: '07-01-2026 20:15:00' })
  creadoEn: Date;
}
