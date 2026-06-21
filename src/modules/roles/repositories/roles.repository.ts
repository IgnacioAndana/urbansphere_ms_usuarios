/**
 * Archivo: roles.repository.ts
 * Ubicación: modules/roles/repositories
 * Tipo: Repositorio
 * Tabla BD: roles
 * Métodos: buscarRolPorId, buscarRolPorNombre, listarRoles, crearRol
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolEntidad } from '../entities/rol.entity';

@Injectable()
export class RolesRepositorio {
  constructor(
    @InjectRepository(RolEntidad)
    private readonly repositorio: Repository<RolEntidad>,
  ) {}

  async buscarRolPorId(id: number): Promise<RolEntidad | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async buscarRolPorNombre(nombre: string): Promise<RolEntidad | null> {
    return this.repositorio.findOne({ where: { nombre } });
  }

  async listarRoles(): Promise<RolEntidad[]> {
    return this.repositorio.find({ order: { nombre: 'ASC' } });
  }

  async crearRol(datos: Partial<RolEntidad>): Promise<RolEntidad> {
    const rol = this.repositorio.create(datos);
    return this.repositorio.save(rol);
  }
}
