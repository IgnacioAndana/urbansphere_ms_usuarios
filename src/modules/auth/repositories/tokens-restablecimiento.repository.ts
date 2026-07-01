/**
 * Archivo: tokens-restablecimiento.repository.ts
 * Ubicación: modules/auth/repositories
 * Tabla BD: tokens_restablecimiento
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenRestablecimientoEntidad } from '../entities/token-restablecimiento.entity';

@Injectable()
export class TokensRestablecimientoRepositorio {
  constructor(
    @InjectRepository(TokenRestablecimientoEntidad)
    private readonly repositorio: Repository<TokenRestablecimientoEntidad>,
  ) {}

  async crearToken(
    datos: Partial<TokenRestablecimientoEntidad>,
  ): Promise<TokenRestablecimientoEntidad> {
    const token = this.repositorio.create(datos);
    return this.repositorio.save(token);
  }

  async buscarPorToken(token: string): Promise<TokenRestablecimientoEntidad | null> {
    return this.repositorio.findOne({
      where: { token },
      relations: ['usuario'],
    });
  }

  async invalidarPendientesPorUsuario(usuarioId: number): Promise<void> {
    await this.repositorio.update({ usuarioId, usado: false }, { usado: true });
  }

  async marcarComoUsado(id: number): Promise<void> {
    await this.repositorio.update(id, { usado: true });
  }
}
