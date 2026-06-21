/**
 * Archivo: usuarios.service.spec.ts
 * Ubicación: modules/users/services
 * Tipo: Pruebas unitarias
 * Contenido: casos de crear, buscar, actualizar y eliminar usuarios
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosServicio } from './usuarios.service';
import { UsuariosRepositorio } from '../repositories/usuarios.repository';
import { RolesRepositorio } from '../../roles/repositories/roles.repository';
import { ExcepcionNegocio } from '../../../common/exceptions/excepcion-negocio.exception';

jest.mock('bcrypt');
jest.mock('uuid', () => ({ v4: () => 'uuid-prueba' }));

describe('UsuariosServicio', () => {
  let servicio: UsuariosServicio;
  let usuariosRepositorio: jest.Mocked<UsuariosRepositorio>;
  let rolesRepositorio: jest.Mocked<RolesRepositorio>;

  const rolMock = { id: 1, nombre: 'user', descripcion: 'Usuario', permisos: [] };
  const usuarioMock = {
    id: 1,
    uuid: 'uuid-prueba',
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    hashContrasena: 'hash',
    rolId: 1,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    rol: rolMock,
    tokensRefresco: [],
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosServicio,
        {
          provide: UsuariosRepositorio,
          useValue: {
            crearUsuario: jest.fn(),
            buscarUsuarioPorId: jest.fn(),
            buscarUsuarioPorEmail: jest.fn(),
            listarUsuarios: jest.fn(),
            actualizarUsuario: jest.fn(),
            eliminarUsuario: jest.fn(),
          },
        },
        {
          provide: RolesRepositorio,
          useValue: {
            buscarRolPorId: jest.fn(),
            buscarRolPorNombre: jest.fn(),
          },
        },
      ],
    }).compile();

    servicio = modulo.get(UsuariosServicio);
    usuariosRepositorio = modulo.get(UsuariosRepositorio);
    rolesRepositorio = modulo.get(RolesRepositorio);
  });

  it('debe crear un usuario', async () => {
    usuariosRepositorio.buscarUsuarioPorEmail.mockResolvedValue(null);
    rolesRepositorio.buscarRolPorNombre.mockResolvedValue(rolMock as never);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    usuariosRepositorio.crearUsuario.mockResolvedValue(usuarioMock as never);

    const resultado = await servicio.crearUsuario({
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      contrasena: 'SecurePass123!',
    });

    expect(resultado.email).toBe('juan@example.com');
    expect(resultado.nombreRol).toBe('user');
  });

  it('debe lanzar error si el email ya existe', async () => {
    usuariosRepositorio.buscarUsuarioPorEmail.mockResolvedValue(usuarioMock as never);

    await expect(
      servicio.crearUsuario({
        nombre: 'Juan',
        email: 'juan@example.com',
        contrasena: 'SecurePass123!',
      }),
    ).rejects.toThrow(ExcepcionNegocio);
  });

  it('debe buscar usuario por id', async () => {
    usuariosRepositorio.buscarUsuarioPorId.mockResolvedValue(usuarioMock as never);
    const resultado = await servicio.buscarUsuarioPorId(1);
    expect(resultado.id).toBe(1);
  });

  it('debe lanzar error si usuario no existe', async () => {
    usuariosRepositorio.buscarUsuarioPorId.mockResolvedValue(null);
    await expect(servicio.buscarUsuarioPorId(999)).rejects.toThrow(ExcepcionNegocio);
  });
});
