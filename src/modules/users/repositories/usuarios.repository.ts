/**
 * Archivo: usuarios.repository.ts
 * Ubicación: modules/users/repositories
 * Tipo: Repositorio
 * Tabla BD: usuarios
 * Métodos: crearUsuario, buscarUsuarioPorId, buscarUsuarioPorEmail, listarUsuarios, actualizarUsuario, eliminarUsuario
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntidad } from '../entities/usuario.entity';

@Injectable()
export class UsuariosRepositorio {
  constructor(
    @InjectRepository(UsuarioEntidad)
    private readonly repositorio: Repository<UsuarioEntidad>,
  ) {}

  async crearUsuario(datos: Partial<UsuarioEntidad>): Promise<UsuarioEntidad> {
    const usuario = this.repositorio.create(datos);
    return this.repositorio.save(usuario);
  }

  async buscarUsuarioPorId(id: number): Promise<UsuarioEntidad | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async buscarUsuarioPorUuid(uuid: string): Promise<UsuarioEntidad | null> {
    return this.repositorio.findOne({ where: { uuid } });
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioEntidad | null> {
    return this.repositorio.findOne({ where: { email } });
  }

  async listarUsuarios(): Promise<UsuarioEntidad[]> {
    return this.repositorio.find({ order: { creadoEn: 'DESC' } });
  }

  async actualizarUsuario(
    id: number,
    datos: Partial<UsuarioEntidad>,
  ): Promise<UsuarioEntidad | null> {
    await this.repositorio.update(id, datos);
    return this.buscarUsuarioPorId(id);
  }

  async eliminarUsuario(id: number): Promise<void> {
    await this.repositorio.delete(id);
  }
}
