/**
 * Archivo: autenticacion.controller.ts
 * Ubicación: modules/auth/controllers
 * Tipo: Controlador REST
 * Endpoints: POST /api/autenticacion/iniciar-sesion, /refrescar, /cerrar-sesion — GET /api/autenticacion/perfil
 */

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioActual } from '../../../common/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IniciarSesionDto, RefrescarTokenDto } from '../dto/iniciar-sesion.dto';
import { CargaJwt } from '../interfaces/carga-jwt.interface';
import { AutenticacionServicio } from '../services/autenticacion.service';
import { UsuariosServicio } from '../../users/services/usuarios.service';
import { RespuestaUsuarioDto } from '../../users/dto/respuesta-usuario.dto';

@ApiTags('Autenticación')
@Controller('autenticacion')
export class AutenticacionControlador {
  constructor(
    private readonly autenticacionServicio: AutenticacionServicio,
    private readonly usuariosServicio: UsuariosServicio,
  ) {}

  @Post('iniciar-sesion')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Retorna tokens de acceso y refresco' })
  iniciarSesion(@Body() dto: IniciarSesionDto) {
    return this.autenticacionServicio.iniciarSesion(dto);
  }

  @Post('refrescar')
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Retorna nuevos tokens' })
  refrescarToken(@Body() dto: RefrescarTokenDto) {
    return this.autenticacionServicio.refrescarToken(dto);
  }

  @Post('cerrar-sesion')
  @ApiOperation({ summary: 'Cerrar sesión e invalidar token de refresco' })
  @ApiResponse({ status: 200 })
  async cerrarSesion(@Body() dto: RefrescarTokenDto): Promise<{ mensaje: string }> {
    await this.autenticacionServicio.cerrarSesion(dto.tokenRefresco);
    return { mensaje: 'Sesión cerrada correctamente' };
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  obtenerPerfil(@UsuarioActual() usuario: CargaJwt): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.buscarUsuarioPorId(usuario.sub);
  }
}
