/**
 * Archivo: roles.controller.ts
 * Ubicación: modules/roles/controllers
 * Tipo: Controlador REST
 * Endpoints: GET /api/roles
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesServicio } from '../services/roles.service';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesControlador {
  constructor(private readonly rolesServicio: RolesServicio) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  listarRoles() {
    return this.rolesServicio.listarRoles();
  }
}
