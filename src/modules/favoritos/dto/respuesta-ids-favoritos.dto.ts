import { ApiProperty } from '@nestjs/swagger';

export class RespuestaIdsFavoritosDto {
  @ApiProperty({ example: [1, 3, 5], type: [Number] })
  proyectoIds: number[];
}

export class RespuestaEsFavoritoDto {
  @ApiProperty({ example: true })
  favorito: boolean;
}
