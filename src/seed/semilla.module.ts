/**
 * Archivo: semilla.module.ts
 * Ubicación: seed
 * Tipo: Módulo NestJS
 * Contenido: registra el servicio de datos iniciales (roles y permisos)
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolEntidad } from '../modules/roles/entities/rol.entity';
import { PermisoEntidad } from '../modules/permissions/entities/permiso.entity';
import { SemillaServicio } from './semilla.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntidad, PermisoEntidad])],
  providers: [SemillaServicio],
})
export class SemillaModule {}
