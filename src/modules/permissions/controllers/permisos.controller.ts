/**
 * Archivo: permisos.controller.ts
 * Ubicación: modules/permissions/controllers
 * Tipo: Controlador REST
 * Endpoints: GET /api/permisos
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosServicio } from '../services/permisos.service';

@ApiTags('Permisos')
@Controller('permisos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermisosControlador {
  constructor(private readonly permisosServicio: PermisosServicio) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los permisos' })
  listarPermisos() {
    return this.permisosServicio.listarPermisos();
  }
}
