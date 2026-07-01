/**
 * Archivo: correo.service.ts
 * Ubicación: common/services
 * Contenido: envío de correos vía Brevo SMTP
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CorreoServicio {
  private readonly logger = new Logger(CorreoServicio.name);

  constructor(private readonly configServicio: ConfigService) {}

  async enviarSolicitudInteres(datos: {
    nombre: string;
    email: string;
    proyectoId: number;
  }): Promise<boolean> {
    const asunto = `UrbanSphere — Interés en proyecto #${datos.proyectoId}`;
    const texto = `Hola ${datos.nombre},\n\nRecibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos tu solicitud de interés en el proyecto <strong>#${datos.proyectoId}</strong>. Un agente se contactará contigo pronto.</p><p>Saludos,<br/>UrbanSphere</p>`;

    return this.enviarCorreo({
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
  }): Promise<boolean> {
    const asunto = 'UrbanSphere — Restablecer contraseña';
    const texto = `Hola ${datos.nombre},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nUsa este enlace (válido por tiempo limitado y un solo uso):\n${datos.enlace}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nUrbanSphere`;
    const html = `<p>Hola <strong>${datos.nombre}</strong>,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${datos.enlace}">Restablecer contraseña</a></p><p>Este enlace es de <strong>un solo uso</strong> y expira en breve.</p><p>Si no solicitaste esto, ignora este correo.</p><p>Saludos,<br/>UrbanSphere</p>`;

    return this.enviarCorreo({
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
  }): Promise<boolean> {
    const smtp = this.configServicio.get<{ host: string; port: number; user: string; pass: string }>(
      'email.smtp',
    );
    const remitenteEmail = this.configServicio.get<string>('email.from');
    const remitenteNombre = this.configServicio.get<string>('email.fromName') || 'UrbanSphere';

    if (!smtp?.user || !smtp.pass) {
      this.logger.warn('BREVO_SMTP_USER o BREVO_SMTP_PASS no configurados: correo no enviado');
      return false;
    }

    if (!remitenteEmail) {
      this.logger.warn('MAIL_FROM no configurado: correo no enviado');
      return false;
    }

    try {
      const transportador = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        requireTLS: smtp.port === 587,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
      });

      await transportador.sendMail({
        from: `"${remitenteNombre}" <${remitenteEmail}>`,
        to: datos.email,
        subject: datos.asunto,
        text: datos.texto,
        html: datos.html,
      });

      this.logger.log(`Correo enviado vía Brevo SMTP a ${datos.email}`);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar el correo a ${datos.email}: ${mensaje}`);
      return false;
    }
  }
}
