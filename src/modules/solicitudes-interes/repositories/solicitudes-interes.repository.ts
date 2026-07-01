/**
 * Archivo: solicitudes-interes.repository.ts
 * Ubicación: modules/solicitudes-interes/repositories
 * Tabla BD: solicitudes_interes
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudInteresEntidad } from '../entities/solicitud-interes.entity';

@Injectable()
export class SolicitudesInteresRepositorio {
  constructor(
    @InjectRepository(SolicitudInteresEntidad)
    private readonly repositorio: Repository<SolicitudInteresEntidad>,
  ) {}

  async crearSolicitud(
    datos: Partial<SolicitudInteresEntidad>,
  ): Promise<SolicitudInteresEntidad> {
    const solicitud = this.repositorio.create(datos);
    return this.repositorio.save(solicitud);
  }

  async listarSolicitudes(): Promise<SolicitudInteresEntidad[]> {
    return this.repositorio.find({ order: { creadoEn: 'DESC' } });
  }

  async listarPorProyecto(proyectoId: number): Promise<SolicitudInteresEntidad[]> {
    return this.repositorio.find({
      where: { proyectoId },
      order: { creadoEn: 'DESC' },
    });
  }
}
