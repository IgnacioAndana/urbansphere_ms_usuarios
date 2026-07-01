/**
 * Archivo: correo.service.ts
 * Ubicación: common/services
 * Contenido: envío de correos vía Brevo API
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorreoServicio implements OnModuleInit {
  private readonly logger = new Logger(CorreoServicio.name);

  constructor(private readonly configServicio: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configServicio.get<string>('email.apiKey');
    const remitente = this.configServicio.get<string>('email.from');

    if (apiKey) {
      this.logger.log('Correo Brevo API configurado');
    } else {
      this.logger.warn('BREVO_API_KEY no configurada: no se enviarán correos');
    }

    if (remitente) {
      this.logger.log(`Remitente: ${remitente}`);
    } else {
      this.logger.warn('MAIL_FROM no configurado');
    }
  }

  async enviarSolicitudInteres(datos: {
    nombre: string;
    email: string;
    proyectoId: number;
  }): Promise<boolean> {
    const asunto = `UrbanSphere — Interés en proyecto #${datos.proyectoId}`;
    const texto = `Hola ${datos.nombre},\n\nRecibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos tu solicitud de interés en el proyecto <strong>#${datos.proyectoId}</strong>. Un agente se contactará contigo pronto.</p><p>Saludos,<br/>UrbanSphere</p>`;

    return this.enviarCorreo({ email: datos.email, asunto, texto, html });
  }

  async enviarRestablecimientoContrasena(datos: {
    nombre: string;
    email: string;
    enlace: string;
  }): Promise<boolean> {
    const asunto = 'UrbanSphere — Restablecer contraseña';
    const texto = `Hola ${datos.nombre},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nUsa este enlace (válido por tiempo limitado y un solo uso):\n${datos.enlace}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${datos.enlace}">Restablecer contraseña</a></p><p>Este enlace es de <strong>un solo uso</strong> y expira en breve.</p><p>Si no solicitaste esto, ignora este correo.</p><p>Saludos,<br/>UrbanSphere</p>`;

    return this.enviarCorreo({ email: datos.email, asunto, texto, html });
  }

  private async enviarCorreo(datos: {
    email: string;
    asunto: string;
    texto: string;
    html: string;
  }): Promise<boolean> {
    const apiKey = this.configServicio.get<string>('email.apiKey');
    const remitenteEmail = this.configServicio.get<string>('email.from');
    const remitenteNombre = this.configServicio.get<string>('email.fromName') || 'UrbanSphere';

    if (!apiKey) {
      this.logger.warn('BREVO_API_KEY no configurada: correo no enviado');
      return false;
    }

    if (!remitenteEmail) {
      this.logger.warn('MAIL_FROM no configurado: correo no enviado');
      return false;
    }

    try {
      const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: remitenteNombre, email: remitenteEmail },
          to: [{ email: datos.email }],
          subject: datos.asunto,
          htmlContent: datos.html,
          textContent: datos.texto,
        }),
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.text();
        throw new Error(cuerpo || `Brevo respondió ${respuesta.status}`);
      }

      const resultado = (await respuesta.json()) as { messageId?: string };
      this.logger.log(
        `Correo enviado vía Brevo a ${datos.email} (id: ${resultado.messageId ?? 'n/a'})`,
      );
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar el correo a ${datos.email}: ${mensaje}`);
      return false;
    }
  }
}
