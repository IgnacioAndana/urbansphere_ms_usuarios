/**
 * Archivo: jwt-opcional.guard.ts
 * Ubicación: common/guards
 * Tipo: Guard de autenticación opcional
 * Contenido: adjunta el usuario JWT si el token es válido, sin bloquear si no hay token
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOpcionalGuard extends AuthGuard('jwt') {
  canActivate(contexto: ExecutionContext) {
    const peticion = contexto.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    if (!peticion.headers.authorization) {
      return true;
    }

    return (super.canActivate(contexto) as Promise<boolean>).catch(() => true);
  }

  handleRequest<TUsuario>(err: Error | null, usuario: TUsuario): TUsuario | null {
    if (err || !usuario) {
      return null;
    }
    return usuario;
  }
}
