/**
 * Archivo: permisos.service.ts
 * Ubicación: modules/permissions/services
 * Tipo: Servicio de negocio
 * Métodos: listarPermisos
 */

import { Injectable } from '@nestjs/common';
import { PermisosRepositorio } from '../repositories/permisos.repository';
import { PermisoEntidad } from '../entities/permiso.entity';

@Injectable()
export class PermisosServicio {
  constructor(private readonly permisosRepositorio: PermisosRepositorio) {}

  async listarPermisos(): Promise<PermisoEntidad[]> {
    return this.permisosRepositorio.listarPermisos();
  }
}
