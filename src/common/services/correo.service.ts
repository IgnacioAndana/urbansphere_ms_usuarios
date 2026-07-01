/**
 * Archivo: correo.service.ts
 * Ubicación: common/services
 * Contenido: envío de correos vía Resend
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class CorreoServicio {
  private readonly logger = new Logger(CorreoServicio.name);

  constructor(private readonly configServicio: ConfigService) {}

  async enviarSolicitudInteres(datos: {
    nombre: string;
    email: string;
    proyectoId: number;
  }): Promise<void> {
    const asunto = `UrbanSphere — Interés en proyecto #${datos.proyectoId}`;
    const texto = `Hola ${datos.nombre},\n\nRecibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos tu solicitud de interés en el proyecto <strong>#${datos.proyectoId}</strong>. Un agente se contactará contigo pronto.</p><p>Saludos,<br/>UrbanSphere</p>`;

    await this.enviarCorreo({
      email: datos.email,
      asunto,
      texto,
      html,
    });
  }

  async enviarRestablecimientoContrasena(datos: {
    nombre: string;
    email: string;
    enlace: string;
  }): Promise<void> {
    const asunto = 'UrbanSphere — Restablecer contraseña';
    const texto = `Hola ${datos.nombre},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nUsa este enlace (válido por tiempo limitado y un solo uso):\n${datos.enlace}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${datos.enlace}">Restablecer contraseña</a></p><p>Este enlace es de <strong>un solo uso</strong> y expira en breve.</p><p>Si no solicitaste esto, ignora este correo.</p><p>Saludos,<br/>UrbanSphere</p>`;

    await this.enviarCorreo({
      email: datos.email,
      asunto,
      texto,
      html,
    });
  }

  private async enviarCorreo(datos: {
    email: string;
    asunto: string;
    texto: string;
    html: string;
  }): Promise<void> {
    const apiKey = this.configServicio.get<string>('email.resendApiKey');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada: correo no enviado');
      return;
    }

    try {
      const resend = new Resend(apiKey);
      const remitente =
        this.configServicio.get<string>('email.from') || 'onboarding@resend.dev';

      const { data, error } = await resend.emails.send({
        from: remitente,
        to: datos.email,
        subject: datos.asunto,
        text: datos.texto,
        html: datos.html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(`Correo enviado a ${datos.email} (id: ${data?.id ?? 'n/a'})`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar el correo a ${datos.email}: ${mensaje}`);
      throw error;
    }
  }
}
