/**
 * Archivo: correo.service.ts
 * Ubicación: modules/solicitudes-interes/services
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
    const apiKey = this.configServicio.get<string>('email.resendApiKey');

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY no configurada: solicitud guardada sin enviar correo',
      );
      return;
    }

    const asunto = `UrbanSphere — Interés en proyecto #${datos.proyectoId}`;
    const texto = `Hola ${datos.nombre},\n\nRecibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos tu solicitud de interés en el proyecto <strong>#${datos.proyectoId}</strong>. Un agente se contactará contigo pronto.</p><p>Saludos,<br/>UrbanSphere</p>`;

    try {
      await this.enviarConResend({ ...datos, asunto, texto, html }, apiKey);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar el correo a ${datos.email}: ${mensaje}`);
    }
  }

  private async enviarConResend(
    datos: {
      nombre: string;
      email: string;
      proyectoId: number;
      asunto: string;
      texto: string;
      html: string;
    },
    apiKey: string,
  ): Promise<void> {
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

    this.logger.log(`Correo enviado vía Resend a ${datos.email} (id: ${data?.id ?? 'n/a'})`);
  }
}
