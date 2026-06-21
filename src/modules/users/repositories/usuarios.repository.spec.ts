/**
 * Archivo: usuarios.repository.spec.ts
 * Ubicación: modules/users/repositories
 * Tipo: Pruebas unitarias
 * Contenido: operaciones de persistencia de usuarios
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuariosRepositorio } from './usuarios.repository';
import { UsuarioEntidad } from '../entities/usuario.entity';

describe('UsuariosRepositorio', () => {
  let repositorio: UsuariosRepositorio;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosRepositorio,
        { provide: getRepositoryToken(UsuarioEntidad), useValue: mockRepo },
      ],
    }).compile();
    repositorio = modulo.get(UsuariosRepositorio);
  });

  it('debe crear usuario', async () => {
    mockRepo.create.mockReturnValue({ nombre: 'Test' });
    mockRepo.save.mockResolvedValue({ id: 1, nombre: 'Test' });
    const resultado = await repositorio.crearUsuario({ nombre: 'Test' });
    expect(resultado.id).toBe(1);
  });

  it('debe buscar por email', async () => {
    mockRepo.findOne.mockResolvedValue({ email: 'a@b.com' });
    const resultado = await repositorio.buscarUsuarioPorEmail('a@b.com');
    expect(resultado?.email).toBe('a@b.com');
  });
});
