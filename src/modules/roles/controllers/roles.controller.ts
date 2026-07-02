/**
 * Archivo: roles.controller.ts
 * Ubicación: modules/roles/controllers
 * Tipo: Controlador REST
 * Endpoints: GET /roles
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLES } from '../../../common/constants/app.constants';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RolesServicio } from '../services/roles.service';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.AGENT)
@ApiBearerAuth()
export class RolesControlador {
  constructor(private readonly rolesServicio: RolesServicio) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles (admin, agent)' })
  listarRoles() {
    return this.rolesServicio.listarRoles();
  }
}
