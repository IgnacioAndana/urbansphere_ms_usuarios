/**
 * Archivo: usuarios.controller.ts
 * Ubicación: modules/users/controllers
 * Tipo: Controlador REST
 * Endpoints: POST/GET/PATCH/DELETE /usuarios
 */

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ROLES } from '../../../common/constants/app.constants';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../../common/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtOpcionalGuard } from '../../../common/guards/jwt-opcional.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CargaJwt } from '../../auth/interfaces/carga-jwt.interface';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { RespuestaUsuarioDto } from '../dto/respuesta-usuario.dto';
import { UsuariosServicio } from '../services/usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosControlador {
  constructor(private readonly usuariosServicio: UsuariosServicio) {}

  @Post()
  @UseGuards(JwtOpcionalGuard)
  @ApiOperation({
    summary: 'Registro público (sin JWT, rol user) o crear usuario (solo admin con JWT)',
  })
  @ApiResponse({ status: 201, type: RespuestaUsuarioDto })
  crearUsuario(
    @Body() dto: CrearUsuarioDto,
    @UsuarioActual() usuarioActual?: CargaJwt | null,
  ): Promise<RespuestaUsuarioDto> {
    if (usuarioActual?.rol === ROLES.ADMIN) {
      return this.usuariosServicio.crearUsuario(dto);
    }
    if (usuarioActual) {
      throw new ForbiddenException('Solo admin puede crear usuarios con sesión iniciada');
    }
    return this.usuariosServicio.crearUsuarioRegistro(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los usuarios (admin, agent)' })
  @ApiResponse({ status: 200, type: [RespuestaUsuarioDto] })
  listarUsuarios(): Promise<RespuestaUsuarioDto[]> {
    return this.usuariosServicio.listarUsuarios();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por ID (admin, agent)' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  buscarUsuarioPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.buscarUsuarioPorId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar usuario (propio perfil o admin/agent sobre otros)',
  })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() usuarioActual: CargaJwt,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.actualizarUsuarioAutorizado(id, dto, usuarioActual);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  @ApiResponse({ status: 204 })
  async eliminarUsuario(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usuariosServicio.eliminarUsuario(id);
  }
}
