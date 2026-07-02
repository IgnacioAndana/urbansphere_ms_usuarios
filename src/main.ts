/**
 * Archivo: main.ts
 * Ubicación: src
 * Tipo: Punto de entrada de la aplicación
 * Contenido: bootstrap NestJS, validación global y Swagger
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('UrbanSphere - MS Usuarios')
    .setDescription('Microservicio de usuarios, autenticación, roles y solicitudes de interés')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documento);

  const puerto = process.env.PORT || 3001;
  await app.listen(puerto);
  console.log(`MS Usuarios en http://localhost:${puerto}`);
  console.log(`Swagger: http://localhost:${puerto}/docs`);
}

bootstrap();
