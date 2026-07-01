/**
 * Archivo: solicitudes-interes.service.ts
 * Ubicación: modules/solicitudes-interes/services
 * Métodos: crearSolicitud, listarSolicitudes, listarPorProyecto
 */

import { Injectable } from '@nestjs/common';
import { CrearSolicitudInteresDto } from '../dto/crear-solicitud-interes.dto';
import { RespuestaSolicitudInteresDto } from '../dto/respuesta-solicitud-interes.dto';
import { SolicitudInteresEntidad } from '../entities/solicitud-interes.entity';
import { SolicitudesInteresRepositorio } from '../repositories/solicitudes-interes.repository';
import { CorreoServicio } from '../../../common/services/correo.service';
import { CargaJwt } from '../../auth/interfaces/carga-jwt.interface';

@Injectable()
export class SolicitudesInteresServicio {
  constructor(
    private readonly solicitudesRepositorio: SolicitudesInteresRepositorio,
    private readonly correoServicio: CorreoServicio,
  ) {}

  async crearSolicitud(
    dto: CrearSolicitudInteresDto,
    usuarioActual?: CargaJwt | null,
  ): Promise<RespuestaSolicitudInteresDto> {
    const email = usuarioActual?.email ?? dto.email;
    const nombre = dto.nombre.trim();

    const solicitud = await this.solicitudesRepositorio.crearSolicitud({
      proyectoId: dto.proyectoId,
      nombre,
      email,
      usuarioId: usuarioActual?.sub ?? null,
    });

    await this.correoServicio.enviarSolicitudInteres({
      nombre,
      email,
      proyectoId: dto.proyectoId,
    });

    return this.mapearARespuesta(solicitud);
  }

  async listarSolicitudes(): Promise<RespuestaSolicitudInteresDto[]> {
    const solicitudes = await this.solicitudesRepositorio.listarSolicitudes();
    return solicitudes.map((s) => this.mapearARespuesta(s));
  }

  async listarPorProyecto(proyectoId: number): Promise<RespuestaSolicitudInteresDto[]> {
    const solicitudes = await this.solicitudesRepositorio.listarPorProyecto(proyectoId);
    return solicitudes.map((s) => this.mapearARespuesta(s));
  }

  private mapearARespuesta(solicitud: SolicitudInteresEntidad): RespuestaSolicitudInteresDto {
    return {
      id: solicitud.id,
      proyectoId: solicitud.proyectoId,
      nombre: solicitud.nombre,
      email: solicitud.email,
      usuarioId: solicitud.usuarioId,
      creadoEn: solicitud.creadoEn,
    };
  }
}
