/**
 * Archivo: solicitudes-interes.module.ts
 * Ubicación: modules/solicitudes-interes
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesInteresControlador } from './controllers/solicitudes-interes.controller';
import { SolicitudesInteresServicio } from './services/solicitudes-interes.service';
import { SolicitudesInteresRepositorio } from './repositories/solicitudes-interes.repository';
import { SolicitudInteresEntidad } from './entities/solicitud-interes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudInteresEntidad])],
  controllers: [SolicitudesInteresControlador],
  providers: [SolicitudesInteresServicio, SolicitudesInteresRepositorio],
})
export class SolicitudesInteresModule {}
