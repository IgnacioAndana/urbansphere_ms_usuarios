/**
 * Archivo: excepcion-negocio.exception.ts
 * Ubicación: common/exceptions
 * Tipo: Excepción HTTP personalizada
 * Contenido: errores de reglas de negocio con código HTTP configurable
 */

import { HttpException, HttpStatus } from '@nestjs/common';

export class ExcepcionNegocio extends HttpException {
  constructor(mensaje: string, estado: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(mensaje, estado);
  }
}
