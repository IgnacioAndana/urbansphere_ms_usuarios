/**
 * Archivo: auth.module.ts
 * Ubicación: modules/auth
 * Tipo: Módulo NestJS
 * Contenido: autenticación JWT — controlador, servicio, tokens de refresco y estrategia Passport
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from '../../config/jwt.config';
import { AutenticacionControlador } from './controllers/autenticacion.controller';
import { AutenticacionServicio } from './services/autenticacion.service';
import { TokensRefrescoRepositorio } from './repositories/tokens-refresco.repository';
import { TokenRefrescoEntidad } from './entities/token-refresco.entity';
import { EstrategiaJwt } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [ConfigService],
      useFactory: (configServicio: ConfigService) => ({
        secret: configServicio.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configServicio.get<string>('jwt.accessExpiresIn'),
        },
      }),
    }),
    TypeOrmModule.forFeature([TokenRefrescoEntidad]),
    UsersModule,
  ],
  controllers: [AutenticacionControlador],
  providers: [AutenticacionServicio, TokensRefrescoRepositorio, EstrategiaJwt],
  exports: [AutenticacionServicio],
})
export class AuthModule {}
