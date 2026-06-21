/**
 * Archivo: usuarios.service.ts
 * Ubicación: modules/users/services
 * Tipo: Servicio de negocio
 * Métodos: crearUsuario, buscarUsuarioPorId, listarUsuarios, actualizarUsuario, eliminarUsuario, mapearARespuesta
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RONDAS_BCRYPT, NOMBRE_ROL_POR_DEFECTO } from '../../../common/constants/app.constants';
import { ExcepcionNegocio } from '../../../common/exceptions/excepcion-negocio.exception';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { RespuestaUsuarioDto } from '../dto/respuesta-usuario.dto';
import { UsuarioEntidad } from '../entities/usuario.entity';
import { UsuariosRepositorio } from '../repositories/usuarios.repository';
import { RolesRepositorio } from '../../roles/repositories/roles.repository';

@Injectable()
export class UsuariosServicio {
  constructor(
    private readonly usuariosRepositorio: UsuariosRepositorio,
    private readonly rolesRepositorio: RolesRepositorio,
  ) {}

  async crearUsuario(dto: CrearUsuarioDto): Promise<RespuestaUsuarioDto> {
    const existente = await this.usuariosRepositorio.buscarUsuarioPorEmail(dto.email);
    if (existente) {
      throw new ExcepcionNegocio('El email ya está registrado', HttpStatus.CONFLICT);
    }

    const rol = dto.rolId
      ? await this.rolesRepositorio.buscarRolPorId(dto.rolId)
      : await this.rolesRepositorio.buscarRolPorNombre(NOMBRE_ROL_POR_DEFECTO);

    if (!rol) {
      throw new ExcepcionNegocio('Rol no encontrado', HttpStatus.BAD_REQUEST);
    }

    const hashContrasena = await bcrypt.hash(dto.contrasena, RONDAS_BCRYPT);

    const usuario = await this.usuariosRepositorio.crearUsuario({
      uuid: uuidv4(),
      nombre: dto.nombre,
      email: dto.email,
      hashContrasena,
      rolId: rol.id,
      activo: true,
    });

    return this.mapearARespuesta(usuario);
  }

  async buscarUsuarioPorId(id: number): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new ExcepcionNegocio('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return this.mapearARespuesta(usuario);
  }

  async listarUsuarios(): Promise<RespuestaUsuarioDto[]> {
    const usuarios = await this.usuariosRepositorio.listarUsuarios();
    return usuarios.map((u) => this.mapearARespuesta(u));
  }

  async actualizarUsuario(id: number, dto: ActualizarUsuarioDto): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new ExcepcionNegocio('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (dto.email && dto.email !== usuario.email) {
      const existente = await this.usuariosRepositorio.buscarUsuarioPorEmail(dto.email);
      if (existente) {
        throw new ExcepcionNegocio('El email ya está registrado', HttpStatus.CONFLICT);
      }
    }

    if (dto.rolId) {
      const rol = await this.rolesRepositorio.buscarRolPorId(dto.rolId);
      if (!rol) {
        throw new ExcepcionNegocio('Rol no encontrado', HttpStatus.BAD_REQUEST);
      }
    }

    const datos: Partial<UsuarioEntidad> = {};
    if (dto.nombre !== undefined) datos.nombre = dto.nombre;
    if (dto.email !== undefined) datos.email = dto.email;
    if (dto.rolId !== undefined) datos.rolId = dto.rolId;
    if (dto.activo !== undefined) datos.activo = dto.activo;
    if (dto.contrasena) {
      datos.hashContrasena = await bcrypt.hash(dto.contrasena, RONDAS_BCRYPT);
    }

    const actualizado = await this.usuariosRepositorio.actualizarUsuario(id, datos);
    if (!actualizado) {
      throw new ExcepcionNegocio('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return this.mapearARespuesta(actualizado);
  }

  async eliminarUsuario(id: number): Promise<void> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new ExcepcionNegocio('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    await this.usuariosRepositorio.eliminarUsuario(id);
  }

  mapearARespuesta(usuario: UsuarioEntidad): RespuestaUsuarioDto {
    return {
      id: usuario.id,
      uuid: usuario.uuid,
      nombre: usuario.nombre,
      email: usuario.email,
      rolId: usuario.rolId,
      nombreRol: usuario.rol?.nombre ?? '',
      activo: usuario.activo,
      creadoEn: usuario.creadoEn,
      actualizadoEn: usuario.actualizadoEn,
    };
  }
}
