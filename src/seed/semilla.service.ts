/**
 * Archivo: semilla.service.ts
 * Ubicación: seed
 * Tipo: Servicio de inicialización
 * Contenido: inserta roles y permisos por defecto al arrancar la aplicación
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ROLES } from '../common/constants/app.constants';
import { PermisoEntidad } from '../modules/permissions/entities/permiso.entity';
import { RolEntidad } from '../modules/roles/entities/rol.entity';

const PERMISOS_POR_DEFECTO = [
  'users.read',
  'users.write',
  'users.delete',
  'roles.read',
  'projects.read',
  'projects.write',
];

const ROLES_POR_DEFECTO = [
  {
    nombre: ROLES.ADMIN,
    descripcion: 'Administrador con acceso completo',
    permisos: PERMISOS_POR_DEFECTO,
  },
  {
    nombre: ROLES.USER,
    descripcion: 'Usuario estándar de la plataforma',
    permisos: ['users.read', 'projects.read'],
  },
  {
    nombre: ROLES.AGENT,
    descripcion: 'Agente inmobiliario',
    permisos: ['users.read', 'projects.read', 'projects.write'],
  },
];

@Injectable()
export class SemillaServicio implements OnModuleInit {
  private readonly logger = new Logger(SemillaServicio.name);

  constructor(
    @InjectRepository(RolEntidad)
    private readonly rolRepositorio: Repository<RolEntidad>,
    @InjectRepository(PermisoEntidad)
    private readonly permisoRepositorio: Repository<PermisoEntidad>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sembrarPermisos();
    await this.sembrarRoles();
  }

  private async sembrarPermisos(): Promise<void> {
    for (const nombre of PERMISOS_POR_DEFECTO) {
      const existe = await this.permisoRepositorio.findOne({ where: { nombre } });
      if (!existe) {
        await this.permisoRepositorio.save(this.permisoRepositorio.create({ nombre }));
        this.logger.log(`Permiso creado: ${nombre}`);
      }
    }
  }

  private async sembrarRoles(): Promise<void> {
    for (const datosRol of ROLES_POR_DEFECTO) {
      const existe = await this.rolRepositorio.findOne({ where: { nombre: datosRol.nombre } });
      if (existe) continue;

      const permisos = await this.permisoRepositorio.find({
        where: { nombre: In(datosRol.permisos) },
      });

      const rol = this.rolRepositorio.create({
        nombre: datosRol.nombre,
        descripcion: datosRol.descripcion,
        permisos,
      });

      await this.rolRepositorio.save(rol);
      this.logger.log(`Rol creado: ${datosRol.nombre}`);
    }
  }
}
