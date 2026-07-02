import { Test, TestingModule } from '@nestjs/testing';
import { CargaJwt } from '../../auth/interfaces/carga-jwt.interface';
import { FavoritosRepositorio } from '../repositories/favoritos.repository';
import { FavoritosServicio } from './favoritos.service';

describe('FavoritosServicio', () => {
  let servicio: FavoritosServicio;
  let repositorio: jest.Mocked<FavoritosRepositorio>;

  const usuario: CargaJwt = {
    sub: 2,
    uuid: 'uuid-test',
    email: 'user@test.com',
    rol: 'user',
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritosServicio,
        {
          provide: FavoritosRepositorio,
          useValue: {
            buscarPorUsuarioYProyecto: jest.fn(),
            crear: jest.fn(),
            eliminar: jest.fn(),
            listarPorUsuario: jest.fn(),
            listarIdsPorUsuario: jest.fn(),
          },
        },
      ],
    }).compile();

    servicio = modulo.get(FavoritosServicio);
    repositorio = modulo.get(FavoritosRepositorio);
  });

  it('agrega favorito nuevo', async () => {
    repositorio.buscarPorUsuarioYProyecto.mockResolvedValue(null);
    repositorio.crear.mockResolvedValue({
      id: 1,
      usuarioId: 2,
      proyectoId: 1,
      creadoEn: new Date('2026-01-07T20:00:00'),
    } as never);

    const resultado = await servicio.agregarFavorito({ proyectoId: 1 }, usuario);

    expect(resultado.proyectoId).toBe(1);
    expect(repositorio.crear).toHaveBeenCalledWith(2, 1);
  });

  it('lanza conflicto si ya existe favorito', async () => {
    repositorio.buscarPorUsuarioYProyecto.mockResolvedValue({ id: 1 } as never);

    await expect(servicio.agregarFavorito({ proyectoId: 1 }, usuario)).rejects.toMatchObject({
      message: 'El proyecto ya está en favoritos',
    });
  });

  it('devuelve ids de favoritos', async () => {
    repositorio.listarIdsPorUsuario.mockResolvedValue([1, 3]);

    const resultado = await servicio.listarIdsFavoritos(usuario);

    expect(resultado.proyectoIds).toEqual([1, 3]);
  });
});
