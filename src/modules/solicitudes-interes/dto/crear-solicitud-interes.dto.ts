/**
 * Archivo: crear-solicitud-interes.dto.ts
 * Ubicación: modules/solicitudes-interes/dto
 * Tipo: DTO de entrada
 * Uso: POST /api/solicitudes-interes
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CrearSolicitudInteresDto {
  @ApiProperty({ example: 1, description: 'ID del proyecto de interés' })
  @IsInt()
  @IsPositive()
  proyectoId: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;
}
