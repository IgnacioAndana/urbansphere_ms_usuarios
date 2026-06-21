/**
 * Archivo: formatear-fechas.interceptor.ts
 * Ubicación: common/interceptors
 * Tipo: Interceptor global
 * Contenido: transforma fechas en respuestas HTTP al formato dd-mm-yyyy HH:mm:ss
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatearFechasEnObjeto } from '../utils/formatear-fecha.util';

@Injectable()
export class FormatearFechasInterceptor implements NestInterceptor {
  intercept(_contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    return siguiente.handle().pipe(map((datos) => formatearFechasEnObjeto(datos)));
  }
}
