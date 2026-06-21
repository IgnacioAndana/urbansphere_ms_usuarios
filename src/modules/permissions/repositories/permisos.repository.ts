/**
 * Archivo: permisos.repository.ts
 * Ubicación: modules/permissions/repositories
 * Tipo: Repositorio
 * Tabla BD: permisos
 * Métodos: listarPermisos, buscarPermisoPorId, buscarPermisoPorNombre, crearPermiso
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermisoEntidad } from '../entities/permiso.entity';

@Injectable()
export class PermisosRepositorio {
  constructor(
    @InjectRepository(PermisoEntidad)
    private readonly repositorio: Repository<PermisoEntidad>,
  ) {}

  async listarPermisos(): Promise<PermisoEntidad[]> {
    return this.repositorio.find({ order: { nombre: 'ASC' } });
  }

  async buscarPermisoPorId(id: number): Promise<PermisoEntidad | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async buscarPermisoPorNombre(nombre: string): Promise<PermisoEntidad | null> {
    return this.repositorio.findOne({ where: { nombre } });
  }

  async crearPermiso(nombre: string): Promise<PermisoEntidad> {
    const permiso = this.repositorio.create({ nombre });
    return this.repositorio.save(permiso);
  }
}
