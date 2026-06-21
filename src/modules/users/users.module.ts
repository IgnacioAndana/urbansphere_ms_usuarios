/**
 * Archivo: users.module.ts
 * Ubicación: modules/users
 * Tipo: Módulo NestJS
 * Contenido: usuarios — controlador, servicio, repositorio y entidad
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosControlador } from './controllers/usuarios.controller';
import { UsuariosServicio } from './services/usuarios.service';
import { UsuariosRepositorio } from './repositories/usuarios.repository';
import { UsuarioEntidad } from './entities/usuario.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntidad]), RolesModule],
  controllers: [UsuariosControlador],
  providers: [UsuariosServicio, UsuariosRepositorio],
  exports: [UsuariosServicio, UsuariosRepositorio],
})
export class UsersModule {}
