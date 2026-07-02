import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProyectoFavoritoEntidad } from '../entities/proyecto-favorito.entity';

@Injectable()
export class FavoritosRepositorio {
  constructor(
    @InjectRepository(ProyectoFavoritoEntidad)
    private readonly repositorio: Repository<ProyectoFavoritoEntidad>,
  ) {}

  async buscarPorUsuarioYProyecto(
    usuarioId: number,
    proyectoId: number,
  ): Promise<ProyectoFavoritoEntidad | null> {
    return this.repositorio.findOne({ where: { usuarioId, proyectoId } });
  }

  async crear(usuarioId: number, proyectoId: number): Promise<ProyectoFavoritoEntidad> {
    const favorito = this.repositorio.create({ usuarioId, proyectoId });
    return this.repositorio.save(favorito);
  }

  async eliminar(usuarioId: number, proyectoId: number): Promise<boolean> {
    const resultado = await this.repositorio.delete({ usuarioId, proyectoId });
    return (resultado.affected ?? 0) > 0;
  }

  async listarPorUsuario(usuarioId: number): Promise<ProyectoFavoritoEntidad[]> {
    return this.repositorio.find({
      where: { usuarioId },
      order: { creadoEn: 'DESC' },
    });
  }

  async listarIdsPorUsuario(usuarioId: number): Promise<number[]> {
    const favoritos = await this.repositorio.find({
      where: { usuarioId },
      select: ['proyectoId'],
      order: { creadoEn: 'DESC' },
    });
    return favoritos.map((f) => f.proyectoId);
  }
}
