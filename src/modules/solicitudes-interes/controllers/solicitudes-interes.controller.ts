/**
 * Archivo: solicitudes-interes.controller.ts
 * Ubicación: modules/solicitudes-interes/controllers
 * Endpoints: POST/GET /solicitudes-interes
 */

import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
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
import { CrearSolicitudInteresDto } from '../dto/crear-solicitud-interes.dto';
import { RespuestaSolicitudInteresDto } from '../dto/respuesta-solicitud-interes.dto';
import { SolicitudesInteresServicio } from '../services/solicitudes-interes.service';

@ApiTags('Solicitudes de interés')
@Controller('solicitudes-interes')
export class SolicitudesInteresControlador {
  constructor(private readonly solicitudesServicio: SolicitudesInteresServicio) {}

  @Post()
  @UseGuards(JwtOpcionalGuard)
  @ApiOperation({
    summary: 'Enviar solicitud "Me interesa este proyecto" (público o con sesión)',
    description:
      'Si hay JWT válido, se usa el email de la sesión. Si no, el front envía nombre y email.',
  })
  @ApiResponse({ status: 201, type: RespuestaSolicitudInteresDto })
  crearSolicitud(
    @Body() dto: CrearSolicitudInteresDto,
    @UsuarioActual() usuarioActual?: CargaJwt | null,
  ): Promise<RespuestaSolicitudInteresDto> {
    return this.solicitudesServicio.crearSolicitud(dto, usuarioActual);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las solicitudes (admin, agent)' })
  @ApiResponse({ status: 200, type: [RespuestaSolicitudInteresDto] })
  listarSolicitudes(): Promise<RespuestaSolicitudInteresDto[]> {
    return this.solicitudesServicio.listarSolicitudes();
  }

  @Get('proyecto/:proyectoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar solicitudes de un proyecto (admin, agent)' })
  @ApiResponse({ status: 200, type: [RespuestaSolicitudInteresDto] })
  listarPorProyecto(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
  ): Promise<RespuestaSolicitudInteresDto[]> {
    return this.solicitudesServicio.listarPorProyecto(proyectoId);
  }
}
