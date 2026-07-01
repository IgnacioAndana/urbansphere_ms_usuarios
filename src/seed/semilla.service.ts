/**
 * Archivo: semilla.service.ts
 * Ubicación: seed
 * Tipo: Servicio de inicialización
 * Contenido: inserta los 3 roles por defecto al arrancar la aplicación
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES } from '../common/constants/app.constants';
import { RolEntidad } from '../modules/roles/entities/rol.entity';

const ROLES_POR_DEFECTO = [
  { nombre: ROLES.ADMIN, descripcion: 'Administrador con acceso completo' },
  { nombre: ROLES.USER, descripcion: 'Usuario estándar de la plataforma' },
  { nombre: ROLES.AGENT, descripcion: 'Agente inmobiliario' },
];

@Injectable()
export class SemillaServicio implements OnModuleInit {
  private readonly logger = new Logger(SemillaServicio.name);

  constructor(
    @InjectRepository(RolEntidad)
    private readonly rolRepositorio: Repository<RolEntidad>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sembrarRoles();
  }

  private async sembrarRoles(): Promise<void> {
    for (const datosRol of ROLES_POR_DEFECTO) {
      const existe = await this.rolRepositorio.findOne({ where: { nombre: datosRol.nombre } });
      if (existe) continue;

      await this.rolRepositorio.save(
        this.rolRepositorio.create({
          nombre: datosRol.nombre,
          descripcion: datosRol.descripcion,
        }),
      );
      this.logger.log(`Rol creado: ${datosRol.nombre}`);
    }
  }
}
