/**
 * Archivo: jwt.strategy.ts
 * Ubicación: modules/auth/strategies
 * Tipo: Estrategia Passport JWT
 * Contenido: validación del token Bearer y extracción de la carga del usuario
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CargaJwt } from '../interfaces/carga-jwt.interface';
import { AutenticacionServicio } from '../services/autenticacion.service';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configServicio: ConfigService,
    private readonly autenticacionServicio: AutenticacionServicio,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configServicio.get<string>('jwt.secret'),
    });
  }

  async validate(carga: CargaJwt): Promise<CargaJwt> {
    try {
      return await this.autenticacionServicio.validarUsuario(carga);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
