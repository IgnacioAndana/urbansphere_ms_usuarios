/**
 * Archivo: correo.service.ts
 * Ubicación: common/services
 * Contenido: envío de correos vía Mailtrap API con plantillas HTML
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailtrapClient } from 'mailtrap';
import {
  configurarPlantillasCorreo,
  plantillaRestablecimientoContrasena,
  plantillaSolicitudInteres,
} from '../correo/plantillas/plantilla-correo.util';

@Injectable()
export class CorreoServicio implements OnModuleInit {
  private readonly logger = new Logger(CorreoServicio.name);
  private cliente: MailtrapClient | null = null;

  constructor(private readonly configServicio: ConfigService) {}

  onModuleInit(): void {
    const token = this.configServicio.get<string>('email.token');
    const remitente = this.configServicio.get<string>('email.from');

    if (token) {
      this.cliente = new MailtrapClient({ token });
      this.logger.log('Correo Mailtrap configurado');
    } else {
      this.logger.warn('MAILTRAP_API_TOKEN no configurado: no se enviarán correos');
    }

    if (remitente) {
      this.logger.log(`Remitente: ${remitente}`);
    } else {
      this.logger.warn('MAIL_FROM no configurado');
    }

    const logoUrl = this.configServicio.get<string>('email.logoUrl');
    configurarPlantillasCorreo({ logoUrl });
    if (logoUrl) {
      this.logger.log(`Logo correo: ${logoUrl}`);
    }
  }

  async enviarSolicitudInteres(datos: {
    nombre: string;
    email: string;
    proyectoId: number;
  }): Promise<boolean> {
    const asunto = `UrbanSphere — Interés en proyecto #${datos.proyectoId}`;
    const { html, texto } = plantillaSolicitudInteres({
      nombre: datos.nombre,
      proyectoId: datos.proyectoId,
    });

    return this.enviarCorreo({ email: datos.email, asunto, texto, html });
  }

  async enviarRestablecimientoContrasena(datos: {
    nombre: string;
    email: string;
    enlace: string;
  }): Promise<boolean> {
    const asunto = 'UrbanSphere — Restablecer contraseña';
    const { html, texto } = plantillaRestablecimientoContrasena({
      nombre: datos.nombre,
      enlace: datos.enlace,
    });

    return this.enviarCorreo({ email: datos.email, asunto, texto, html });
  }

  private async enviarCorreo(datos: {
    email: string;
    asunto: string;
    texto: string;
    html: string;
  }): Promise<boolean> {
    const remitenteEmail = this.configServicio.get<string>('email.from');
    const remitenteNombre = this.configServicio.get<string>('email.fromName') || 'UrbanSphere';

    if (!this.cliente) {
      this.logger.warn('MAILTRAP_API_TOKEN no configurado: correo no enviado');
      return false;
    }

    if (!remitenteEmail) {
      this.logger.warn('MAIL_FROM no configurado: correo no enviado');
      return false;
    }

    try {
      const resultado = await this.cliente.send({
        from: { email: remitenteEmail, name: remitenteNombre },
        to: [{ email: datos.email }],
        subject: datos.asunto,
        text: datos.texto,
        html: datos.html,
        category: 'UrbanSphere',
      });

      this.logger.log(`Correo enviado vía Mailtrap a ${datos.email} (id: ${resultado.message_ids?.[0] ?? 'n/a'})`);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar el correo a ${datos.email}: ${mensaje}`);
      return false;
    }
  }
}
