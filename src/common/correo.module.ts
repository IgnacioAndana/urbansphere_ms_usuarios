/**
 * Archivo: correo.module.ts
 * Ubicación: common
 * Contenido: servicio compartido de correo (Brevo SMTP)
 */

import { Global, Module } from '@nestjs/common';
import { CorreoServicio } from './services/correo.service';

@Global()
@Module({
  providers: [CorreoServicio],
  exports: [CorreoServicio],
})
export class CorreoModule {}
