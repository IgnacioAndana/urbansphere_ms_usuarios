/**
 * Archivo: tokens-refresco.repository.ts
 * Ubicación: modules/auth/repositories
 * Tipo: Repositorio
 * Tabla BD: tokens_refresco
 * Métodos: crearTokenRefresco, buscarPorToken, eliminarPorToken, eliminarPorUsuarioId, eliminarExpirados
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TokenRefrescoEntidad } from '../entities/token-refresco.entity';

@Injectable()
export class TokensRefrescoRepositorio {
  constructor(
    @InjectRepository(TokenRefrescoEntidad)
    private readonly repositorio: Repository<TokenRefrescoEntidad>,
  ) {}

  async crearTokenRefresco(
    datos: Partial<TokenRefrescoEntidad>,
  ): Promise<TokenRefrescoEntidad> {
    const token = this.repositorio.create(datos);
    return this.repositorio.save(token);
  }

  async buscarPorToken(token: string): Promise<TokenRefrescoEntidad | null> {
    return this.repositorio.findOne({
      where: { token },
      relations: ['usuario', 'usuario.rol'],
    });
  }

  async eliminarPorToken(token: string): Promise<void> {
    await this.repositorio.delete({ token });
  }

  async eliminarPorUsuarioId(usuarioId: number): Promise<void> {
    await this.repositorio.delete({ usuarioId });
  }

  async eliminarExpirados(): Promise<void> {
    await this.repositorio.delete({ expiraEn: LessThan(new Date()) });
  }
}
