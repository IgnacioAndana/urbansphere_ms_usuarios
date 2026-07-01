/**
 * Archivo: autenticacion.service.spec.ts
 * Ubicación: modules/auth/services
 * Tipo: Pruebas unitarias
 * Contenido: iniciar sesión, refrescar token y validar usuario
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AutenticacionServicio } from './autenticacion.service';
import { UsuariosRepositorio } from '../../users/repositories/usuarios.repository';
import { UsuariosServicio } from '../../users/services/usuarios.service';
import { TokensRefrescoRepositorio } from '../repositories/tokens-refresco.repository';

jest.mock('bcrypt');

describe('AutenticacionServicio', () => {
  let servicio: AutenticacionServicio;
  let usuariosRepositorio: jest.Mocked<UsuariosRepositorio>;

  const usuarioMock = {
    id: 1,
    uuid: 'uuid-1',
    nombre: 'Juan',
    email: 'juan@example.com',
    hashContrasena: 'hash',
    rolId: 1,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    rol: { id: 1, nombre: 'user', descripcion: '', usuarios: [] },
    tokensRefresco: [],
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacionServicio,
        {
          provide: UsuariosRepositorio,
          useValue: { buscarUsuarioPorEmail: jest.fn(), buscarUsuarioPorId: jest.fn() },
        },
        {
          provide: UsuariosServicio,
          useValue: { mapearARespuesta: jest.fn().mockReturnValue({ id: 1, email: 'juan@example.com' }) },
        },
        {
          provide: TokensRefrescoRepositorio,
          useValue: {
            crearTokenRefresco: jest.fn(),
            buscarPorToken: jest.fn(),
            eliminarPorToken: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token-acceso') } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((clave: string) =>
              ({ 'jwt.accessExpiresIn': '15m', 'jwt.refreshExpiresIn': '7d' })[clave],
            ),
          },
        },
      ],
    }).compile();

    servicio = modulo.get(AutenticacionServicio);
    usuariosRepositorio = modulo.get(UsuariosRepositorio);
  });

  it('debe iniciar sesión con credenciales válidas', async () => {
    usuariosRepositorio.buscarUsuarioPorEmail.mockResolvedValue(usuarioMock as never);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const resultado = await servicio.iniciarSesion({
      email: 'juan@example.com',
      contrasena: 'SecurePass123!',
    });

    expect(resultado.tokenAcceso).toBe('token-acceso');
    expect(resultado.tokenRefresco).toBeDefined();
  });

  it('debe fallar con credenciales inválidas', async () => {
    usuariosRepositorio.buscarUsuarioPorEmail.mockResolvedValue(null);

    await expect(
      servicio.iniciarSesion({ email: 'x@example.com', contrasena: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
