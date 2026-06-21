/**
 * Archivo: app.module.ts
 * Ubicación: src
 * Tipo: Módulo raíz NestJS
 * Contenido: configuración global, TypeORM, módulos de dominio y filtro de excepciones
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { FiltroExcepcionesHttp } from './common/filters/filtro-excepciones-http.filter';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SemillaModule } from './seed/semilla.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, rabbitmqConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configServicio: ConfigService) => ({
        ...configServicio.get('database'),
      }),
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    SemillaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FiltroExcepcionesHttp,
    },
  ],
})
export class AppModule {}
