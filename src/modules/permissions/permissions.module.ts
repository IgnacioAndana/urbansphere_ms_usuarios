/**
 * Archivo: permissions.module.ts
 * Ubicación: modules/permissions
 * Tipo: Módulo NestJS
 * Contenido: permisos — controlador, servicio, repositorio y entidad
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosControlador } from './controllers/permisos.controller';
import { PermisosServicio } from './services/permisos.service';
import { PermisosRepositorio } from './repositories/permisos.repository';
import { PermisoEntidad } from './entities/permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermisoEntidad])],
  controllers: [PermisosControlador],
  providers: [PermisosServicio, PermisosRepositorio],
  exports: [PermisosServicio, PermisosRepositorio],
})
export class PermissionsModule {}
