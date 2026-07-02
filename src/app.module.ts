/**
 * Archivo: app.module.ts
 * Ubicación: src
 * Tipo: Módulo raíz NestJS
 * Contenido: configuración global, TypeORM, módulos de dominio y filtro de excepciones
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import rabbitmqConfig from './config/rabbitmq.config';
import emailConfig from './config/email.config';
import appConfig from './config/app.config';
import { CorreoModule } from './common/correo.module';
import { FiltroExcepcionesHttp } from './common/filters/filtro-excepciones-http.filter';
import { FormatearFechasInterceptor } from './common/interceptors/formatear-fechas.interceptor';
import { LoggingHttpInterceptor } from './common/interceptors/logging-http.interceptor';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { SolicitudesInteresModule } from './modules/solicitudes-interes/solicitudes-interes.module';
import { FavoritosModule } from './modules/favoritos/favoritos.module';
import { SemillaModule } from './seed/semilla.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, rabbitmqConfig, emailConfig, appConfig],
    }),
    CorreoModule,
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
    SolicitudesInteresModule,
    FavoritosModule,
    SemillaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FiltroExcepcionesHttp,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatearFechasInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingHttpInterceptor,
    },
  ],
})
export class AppModule {}
