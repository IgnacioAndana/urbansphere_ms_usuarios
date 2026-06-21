/**
 * Archivo: usuarios.controller.ts
 * Ubicación: modules/users/controllers
 * Tipo: Controlador REST
 * Endpoints: POST/GET/PATCH/DELETE /api/usuarios
 */

import {
  Body,
  Controller,
  Delete,
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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { RespuestaUsuarioDto } from '../dto/respuesta-usuario.dto';
import { UsuariosServicio } from '../services/usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosControlador {
  constructor(private readonly usuariosServicio: UsuariosServicio) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, type: RespuestaUsuarioDto })
  crearUsuario(@Body() dto: CrearUsuarioDto): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.crearUsuario(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, type: [RespuestaUsuarioDto] })
  listarUsuarios(): Promise<RespuestaUsuarioDto[]> {
    return this.usuariosServicio.listarUsuarios();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  buscarUsuarioPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.buscarUsuarioPorId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.actualizarUsuario(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 204 })
  async eliminarUsuario(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usuariosServicio.eliminarUsuario(id);
  }
}
