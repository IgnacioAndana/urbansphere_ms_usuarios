/**
 * Archivo: iniciar-sesion.dto.ts
 * Ubicación: modules/auth/dto
 * Tipo: DTO de entrada
 * Uso: POST /autenticacion/iniciar-sesion, /refrescar, /cerrar-sesion
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class IniciarSesionDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  contrasena: string;
}

export class RefrescarTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tokenRefresco: string;
}
