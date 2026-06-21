/**
 * Archivo: crear-usuario.dto.ts
 * Ubicación: modules/users/dto
 * Tipo: DTO de entrada
 * Uso: POST /api/usuarios — registro de nuevo usuario
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  contrasena: string;

  @ApiPropertyOptional({ example: 2, description: 'ID del rol (por defecto: user)' })
  @IsOptional()
  rolId?: number;
}
