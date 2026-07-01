/**
 * Archivo: semilla.module.ts
 * Ubicación: seed
 * Tipo: Módulo NestJS
 * Contenido: registra el servicio de datos iniciales (roles)
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolEntidad } from '../modules/roles/entities/rol.entity';
import { SemillaServicio } from './semilla.service';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntidad])],
  providers: [SemillaServicio],
})
export class SemillaModule {}
