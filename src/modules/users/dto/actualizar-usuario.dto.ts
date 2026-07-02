/**
 * Archivo: actualizar-usuario.dto.ts
 * Ubicación: modules/users/dto
 * Tipo: DTO de entrada
 * Uso: PATCH /usuarios/:id — actualización parcial de usuario
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarUsuarioDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NuevaSecurePass123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  contrasena?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  rolId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
