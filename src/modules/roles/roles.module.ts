/**
 * Archivo: roles.module.ts
 * Ubicación: modules/roles
 * Tipo: Módulo NestJS
 * Contenido: roles — controlador, servicio, repositorio y entidad
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesControlador } from './controllers/roles.controller';
import { RolesServicio } from './services/roles.service';
import { RolesRepositorio } from './repositories/roles.repository';
import { RolEntidad } from './entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntidad])],
  controllers: [RolesControlador],
  providers: [RolesServicio, RolesRepositorio],
  exports: [RolesServicio, RolesRepositorio],
})
export class RolesModule {}
