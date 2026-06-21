/**
 * Archivo: filtro-excepciones-http.filter.ts
 * Ubicación: common/filters
 * Tipo: Filtro global de excepciones
 * Contenido: formatea errores HTTP y excepciones no controladas en respuestas JSON
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatearFechaRespuesta } from '../utils/formatear-fecha.util';

@Catch()
export class FiltroExcepcionesHttp implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionesHttp.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const respuesta = ctx.getResponse<Response>();
    const peticion = ctx.getRequest<Request>();

    const estado =
      excepcion instanceof HttpException
        ? excepcion.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const mensaje =
      excepcion instanceof HttpException
        ? excepcion.getResponse()
        : 'Error interno del servidor';

    this.logger.error(
      `${peticion.method} ${peticion.url} - ${JSON.stringify(mensaje)}`,
      excepcion instanceof Error ? excepcion.stack : undefined,
    );

    respuesta.status(estado).json({
      codigoEstado: estado,
      fecha: formatearFechaRespuesta(new Date()),
      ruta: peticion.url,
      mensaje,
    });
  }
}
