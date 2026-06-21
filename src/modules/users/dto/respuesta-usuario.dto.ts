/**
 * Archivo: respuesta-usuario.dto.ts
 * Ubicación: modules/users/dto
 * Tipo: DTO de salida
 * Uso: respuestas de endpoints de usuarios y perfil autenticado
 */

import { ApiProperty } from '@nestjs/swagger';

export class RespuestaUsuarioDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  rolId: number;

  @ApiProperty()
  nombreRol: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty({
    type: String,
    example: '20-06-2025 14:30:45',
    description: 'En respuesta HTTP: dd-mm-yyyy HH:mm:ss',
  })
  creadoEn: Date;

  @ApiProperty({
    type: String,
    example: '20-06-2025 14:30:45',
    description: 'En respuesta HTTP: dd-mm-yyyy HH:mm:ss',
  })
  actualizadoEn: Date;
}
