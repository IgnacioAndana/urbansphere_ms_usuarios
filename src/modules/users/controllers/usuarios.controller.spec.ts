/**
 * Archivo: usuarios.controller.spec.ts
 * Ubicación: modules/users/controllers
 * Tipo: Pruebas unitarias
 * Contenido: endpoints del controlador de usuarios
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosControlador } from './usuarios.controller';
import { UsuariosServicio } from '../services/usuarios.service';

describe('UsuariosControlador', () => {
  let controlador: UsuariosControlador;
  let servicio: jest.Mocked<UsuariosServicio>;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosControlador],
      providers: [
        {
          provide: UsuariosServicio,
          useValue: {
            crearUsuario: jest.fn(),
            listarUsuarios: jest.fn(),
            buscarUsuarioPorId: jest.fn(),
            actualizarUsuario: jest.fn(),
            eliminarUsuario: jest.fn(),
          },
        },
      ],
    }).compile();

    controlador = modulo.get(UsuariosControlador);
    servicio = modulo.get(UsuariosServicio);
  });

  it('debe registrar usuario', async () => {
    const dto = { nombre: 'Juan', email: 'juan@example.com', contrasena: 'SecurePass123!' };
    servicio.crearUsuario.mockResolvedValue({ id: 1, ...dto } as never);
    const resultado = await controlador.crearUsuario(dto);
    expect(resultado.id).toBe(1);
  });

  it('debe listar usuarios', async () => {
    servicio.listarUsuarios.mockResolvedValue([]);
    expect(await controlador.listarUsuarios()).toEqual([]);
  });
});
