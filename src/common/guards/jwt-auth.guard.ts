/**
 * Archivo: jwt-auth.guard.ts
 * Ubicación: common/guards
 * Tipo: Guard de autenticación
 * Contenido: protege rutas que requieren JWT Bearer válido
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
