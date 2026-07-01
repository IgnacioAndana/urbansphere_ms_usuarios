/**
 * Archivo: logging-http.interceptor.ts
 * Ubicación: common/interceptors
 * Tipo: Interceptor global
 * Contenido: registra en consola cada petición HTTP (método, ruta, status, duración)
 */

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CargaJwt } from '../../modules/auth/interfaces/carga-jwt.interface';

const RUTAS_IGNORADAS = ['/api/docs', '/api/docs-json', '/favicon.ico'];

@Injectable()
export class LoggingHttpInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly configServicio: ConfigService) {}

  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    if (!this.estaHabilitado()) {
      return siguiente.handle();
    }

    const peticion = contexto.switchToHttp().getRequest<Request & { user?: CargaJwt }>();
    const { method, originalUrl } = peticion;

    if (this.debeIgnorarRuta(originalUrl)) {
      return siguiente.handle();
    }

    const inicio = Date.now();
    const usuario = peticion.user?.email;
    const prefijoUsuario = usuario ? ` [${usuario}]` : '';

    this.logger.log(`→ ${method} ${originalUrl}${prefijoUsuario}`);

    return siguiente.handle().pipe(
      tap(() => {
        const respuesta = contexto.switchToHttp().getResponse<Response>();
        const duracionMs = Date.now() - inicio;
        this.logger.log(
          `← ${method} ${originalUrl} ${respuesta.statusCode} ${duracionMs}ms${prefijoUsuario}`,
        );
      }),
      catchError((error: unknown) => {
        const duracionMs = Date.now() - inicio;
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : ((error as { status?: number }).status ?? 500);
        const mensaje = error instanceof Error ? error.message : 'Error interno';
        this.logger.warn(
          `← ${method} ${originalUrl} ${status} ${duracionMs}ms — ${mensaje}${prefijoUsuario}`,
        );
        return throwError(() => error);
      }),
    );
  }

  private estaHabilitado(): boolean {
    return this.configServicio.get<boolean>('app.httpLogging') !== false;
  }

  private debeIgnorarRuta(ruta: string): boolean {
    return RUTAS_IGNORADAS.some((ignorada) => ruta.startsWith(ignorada));
  }
}
