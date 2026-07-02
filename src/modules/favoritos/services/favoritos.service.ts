import { HttpStatus, Injectable } from '@nestjs/common';
import { ExcepcionNegocio } from '../../../common/exceptions/excepcion-negocio.exception';
import { CargaJwt } from '../../auth/interfaces/carga-jwt.interface';
import { AgregarFavoritoDto } from '../dto/agregar-favorito.dto';
import {
  RespuestaEsFavoritoDto,
  RespuestaIdsFavoritosDto,
} from '../dto/respuesta-ids-favoritos.dto';
import { RespuestaFavoritoDto } from '../dto/respuesta-favorito.dto';
import { ProyectoFavoritoEntidad } from '../entities/proyecto-favorito.entity';
import { FavoritosRepositorio } from '../repositories/favoritos.repository';

@Injectable()
export class FavoritosServicio {
  constructor(private readonly favoritosRepositorio: FavoritosRepositorio) {}

  async agregarFavorito(
    dto: AgregarFavoritoDto,
    usuarioActual: CargaJwt,
  ): Promise<RespuestaFavoritoDto> {
    const usuarioId = Number(usuarioActual.sub);
    const existente = await this.favoritosRepositorio.buscarPorUsuarioYProyecto(
      usuarioId,
      dto.proyectoId,
    );

    if (existente) {
      throw new ExcepcionNegocio('El proyecto ya está en favoritos', HttpStatus.CONFLICT);
    }

    const favorito = await this.favoritosRepositorio.crear(usuarioId, dto.proyectoId);
    return this.mapearARespuesta(favorito);
  }

  async quitarFavorito(proyectoId: number, usuarioActual: CargaJwt): Promise<void> {
    const eliminado = await this.favoritosRepositorio.eliminar(
      Number(usuarioActual.sub),
      proyectoId,
    );

    if (!eliminado) {
      throw new ExcepcionNegocio('El proyecto no está en favoritos', HttpStatus.NOT_FOUND);
    }
  }

  async listarMisFavoritos(usuarioActual: CargaJwt): Promise<RespuestaFavoritoDto[]> {
    const favoritos = await this.favoritosRepositorio.listarPorUsuario(Number(usuarioActual.sub));
    return favoritos.map((f) => this.mapearARespuesta(f));
  }

  async listarIdsFavoritos(usuarioActual: CargaJwt): Promise<RespuestaIdsFavoritosDto> {
    const proyectoIds = await this.favoritosRepositorio.listarIdsPorUsuario(
      Number(usuarioActual.sub),
    );
    return { proyectoIds };
  }

  async esFavorito(
    proyectoId: number,
    usuarioActual: CargaJwt,
  ): Promise<RespuestaEsFavoritoDto> {
    const favorito = await this.favoritosRepositorio.buscarPorUsuarioYProyecto(
      Number(usuarioActual.sub),
      proyectoId,
    );
    return { favorito: !!favorito };
  }

  private mapearARespuesta(favorito: ProyectoFavoritoEntidad): RespuestaFavoritoDto {
    return {
      id: favorito.id,
      proyectoId: favorito.proyectoId,
      creadoEn: favorito.creadoEn,
    };
  }
}
