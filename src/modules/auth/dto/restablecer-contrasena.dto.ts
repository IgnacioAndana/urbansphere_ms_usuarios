/**
 * Archivo: restablecer-contrasena.dto.ts
 * Ubicación: modules/auth/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SolicitarRestablecimientoDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;
}

export class RestablecerContrasenaDto {
  @ApiProperty({ description: 'Token de un solo uso recibido por correo' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NuevaSecurePass123!' })
  @IsString()
  @MinLength(8)
  contrasena: string;
}

export class ValidarTokenRestablecimientoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
