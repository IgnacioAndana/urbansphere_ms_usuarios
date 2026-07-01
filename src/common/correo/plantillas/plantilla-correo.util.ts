/**
 * Plantillas HTML para correos transaccionales UrbanSphere.
 * Las imágenes se incrustan en base64 para compatibilidad con clientes de correo.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const COLORES = {
  fondo: '#f1f5f9',
  tarjeta: '#ffffff',
  encabezado: '#0b0f14',
  texto: '#334155',
  textoSuave: '#64748b',
  acento: '#2563eb',
  acentoOscuro: '#1d4ed8',
  borde: '#e2e8f0',
};

let logoImagotipoBase64: string | null = null;

function resolverRutaAssets(): string {
  const candidatos = [
    join(__dirname, '..', 'assets'),
    join(process.cwd(), 'dist', 'common', 'correo', 'assets'),
    join(process.cwd(), 'src', 'common', 'correo', 'assets'),
  ];

  for (const ruta of candidatos) {
    if (existsSync(ruta)) {
      return ruta;
    }
  }

  return join(__dirname, '..', 'assets');
}

function cargarLogoImagotipo(): string {
  if (logoImagotipoBase64) {
    return logoImagotipoBase64;
  }

  const candidatos = ['UrbanSphere-Imagotipo-2.png', 'UrbanSphere-Imagotipo.png'];

  for (const archivo of candidatos) {
    const ruta = join(resolverRutaAssets(), archivo);
    if (existsSync(ruta)) {
      const buffer = readFileSync(ruta);
      logoImagotipoBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
      return logoImagotipoBase64;
    }
  }

  return '';
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plantillaBase(opciones: {
  titulo: string;
  cuerpo: string;
  anio?: number;
}): string {
  const logo = cargarLogoImagotipo();
  const anio = opciones.anio ?? new Date().getFullYear();
  const logoHtml = logo
    ? `<img src="${logo}" alt="UrbanSphere" width="220" style="display:block;margin:0 auto;max-width:220px;height:auto;" />`
    : `<p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">UrbanSphere</p>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaparHtml(opciones.titulo)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORES.fondo};font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${COLORES.fondo};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:${COLORES.tarjeta};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background-color:${COLORES.encabezado};padding:28px 32px;text-align:center;">
              ${logoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;color:${COLORES.texto};font-size:16px;line-height:1.6;">
              ${opciones.cuerpo}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid ${COLORES.borde};background-color:#f8fafc;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${COLORES.textoSuave};">
                © ${anio} UrbanSphere · Plataforma inmobiliaria
              </p>
              <p style="margin:0;font-size:11px;color:${COLORES.textoSuave};">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function botonPrincipal(enlace: string, texto: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:${COLORES.acento};">
      <a href="${escaparHtml(enlace)}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background-color:${COLORES.acento};border:1px solid ${COLORES.acentoOscuro};">
        ${escaparHtml(texto)}
      </a>
    </td>
  </tr>
</table>`;
}

export function plantillaRestablecimientoContrasena(datos: {
  nombre: string;
  enlace: string;
}): { html: string; texto: string } {
  const nombre = escaparHtml(datos.nombre);
  const enlace = datos.enlace;

  const cuerpo = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">Hola, ${nombre}</p>
    <p style="margin:0 0 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en UrbanSphere.</p>
    <p style="margin:0 0 8px;">Haz clic en el botón para crear una nueva contraseña:</p>
    ${botonPrincipal(enlace, 'Restablecer contraseña')}
    <p style="margin:0 0 12px;font-size:14px;color:${COLORES.textoSuave};">
      Este enlace es de <strong>un solo uso</strong> y expira en breve por seguridad.
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:${COLORES.textoSuave};word-break:break-all;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
      <a href="${escaparHtml(enlace)}" style="color:${COLORES.acento};">${escaparHtml(enlace)}</a>
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:${COLORES.textoSuave};">
      Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.
    </p>`;

  const texto = `Hola ${datos.nombre},

Recibimos una solicitud para restablecer tu contraseña en UrbanSphere.

Restablecer contraseña: ${enlace}

Este enlace es de un solo uso y expira en breve.

Si no solicitaste esto, ignora este correo.

Saludos,
UrbanSphere`;

  return {
    html: plantillaBase({ titulo: 'Restablecer contraseña', cuerpo }),
    texto,
  };
}

export function plantillaSolicitudInteres(datos: {
  nombre: string;
  proyectoId: number;
}): { html: string; texto: string } {
  const nombre = escaparHtml(datos.nombre);

  const cuerpo = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">Hola, ${nombre}</p>
    <p style="margin:0 0 16px;">Recibimos tu solicitud de interés en el proyecto <strong>#${datos.proyectoId}</strong>.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background-color:#f8fafc;border:1px solid ${COLORES.borde};border-radius:8px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:${COLORES.textoSuave};">Proyecto</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">#${datos.proyectoId}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;">Un agente de UrbanSphere se pondrá en contacto contigo pronto para brindarte más información.</p>
    <p style="margin:16px 0 0;font-size:14px;color:${COLORES.textoSuave};">
      Gracias por confiar en nosotros.
    </p>`;

  const texto = `Hola ${datos.nombre},

Recibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.

Saludos,
UrbanSphere`;

  return {
    html: plantillaBase({ titulo: 'Solicitud de interés recibida', cuerpo }),
    texto,
  };
}
