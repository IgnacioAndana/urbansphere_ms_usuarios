/**
 * Archivo: roles.service.ts
 * Ubicación: modules/roles/services
 * Tipo: Servicio de negocio
 * Métodos: listarRoles, buscarRolPorId
 */

import { Injectable } from '@nestjs/common';
import { RolesRepositorio } from '../repositories/roles.repository';
import { RolEntidad } from '../entities/rol.entity';

@Injectable()
export class RolesServicio {
  constructor(private readonly rolesRepositorio: RolesRepositorio) {}

  async listarRoles(): Promise<RolEntidad[]> {
    return this.rolesRepositorio.listarRoles();
  }

  async buscarRolPorId(id: number): Promise<RolEntidad | null> {
    return this.rolesRepositorio.buscarRolPorId(id);
  }
}
