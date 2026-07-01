/**
 * Archivo: respuesta-solicitud-interes.dto.ts
 * Ubicación: modules/solicitudes-interes/dto
 * Tipo: DTO de salida
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RespuestaSolicitudInteresDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  proyectoId: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  usuarioId: number | null;

  @ApiProperty({ example: '20-06-2025 14:30:45' })
  creadoEn: Date;
}
