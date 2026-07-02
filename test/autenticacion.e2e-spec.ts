/**
 * Archivo: autenticacion.e2e-spec.ts
 * Ubicación: test
 * Tipo: Pruebas end-to-end
 * Contenido: registro, login exitoso y login fallido
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Autenticación (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const usuarioPrueba = {
    nombre: 'Usuario E2E',
    email: `e2e-${Date.now()}@example.com`,
    contrasena: 'SecurePass123!',
  };

  it('POST /usuarios — debe registrar usuario', () => {
    return request(app.getHttpServer())
      .post('/usuarios')
      .send(usuarioPrueba)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(usuarioPrueba.email);
        expect(res.body.contrasena).toBeUndefined();
      });
  });

  it('POST /autenticacion/iniciar-sesion — login exitoso', () => {
    return request(app.getHttpServer())
      .post('/autenticacion/iniciar-sesion')
      .send({ email: usuarioPrueba.email, contrasena: usuarioPrueba.contrasena })
      .expect(201)
      .expect((res) => {
        expect(res.body.tokenAcceso).toBeDefined();
        expect(res.body.tokenRefresco).toBeDefined();
      });
  });

  it('POST /autenticacion/iniciar-sesion — login fallido', () => {
    return request(app.getHttpServer())
      .post('/autenticacion/iniciar-sesion')
      .send({ email: usuarioPrueba.email, contrasena: 'ContrasenaIncorrecta!' })
      .expect(401);
  });
});
