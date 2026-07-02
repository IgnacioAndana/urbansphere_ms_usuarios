/**
 * Plantillas HTML para correos transaccionales UrbanSphere.
 * Sin imágenes embebidas (base64): Gmail recorta correos >102 KB y bloquea data URIs.
 * Logo opcional vía URL pública (EMAIL_LOGO_URL).
 */

const COLORES = {
  fondo: '#f1f5f9',
  tarjeta: '#ffffff',
  encabezado: '#ffffff',
  texto: '#334155',
  textoSuave: '#64748b',
  acento: '#2563eb',
  acentoOscuro: '#1d4ed8',
  borde: '#e2e8f0',
  marcaOscura: '#475569',
};

let urlLogo = '';

export function configurarPlantillasCorreo(opciones: { logoUrl?: string }): void {
  urlLogo = opciones.logoUrl?.trim() ?? '';
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function encabezadoMarca(): string {
  if (urlLogo) {
    // Imagotipo con fondo blanco: header blanco puro para que no se note el borde del PNG
    return `<img src="${escaparHtml(urlLogo)}" alt="UrbanSphere" width="240" style="display:block;margin:0 auto;max-width:240px;width:100%;height:auto;border:0;background-color:#ffffff;" />`;
  }

  return `<p style="margin:0;font-size:28px;font-weight:700;line-height:1.2;">
    <span style="color:${COLORES.acento};">Urban</span><span style="color:${COLORES.marcaOscura};">Sphere</span>
  </p>
  <p style="margin:8px 0 0;font-size:11px;color:${COLORES.textoSuave};letter-spacing:1.5px;text-transform:uppercase;">
    Plataforma inmobiliaria
  </p>`;
}

function plantillaBase(opciones: {
  titulo: string;
  preheader: string;
  cuerpo: string;
  anio?: number;
}): string {
  const anio = opciones.anio ?? new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaparHtml(opciones.titulo)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORES.fondo};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escaparHtml(opciones.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${COLORES.fondo};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:${COLORES.tarjeta};border-radius:12px;overflow:hidden;border:1px solid ${COLORES.borde};">
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px 20px;text-align:center;border-bottom:1px solid ${COLORES.borde};">
              ${encabezadoMarca()}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 24px;color:${COLORES.texto};font-size:16px;line-height:1.6;">
              ${opciones.cuerpo}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 28px;border-top:1px solid ${COLORES.borde};background-color:#f8fafc;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:${COLORES.textoSuave};">© ${anio} UrbanSphere</p>
              <p style="margin:0;font-size:11px;color:${COLORES.textoSuave};">Correo automático — no responder</p>
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
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:${COLORES.acento};">
      <a href="${escaparHtml(enlace)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
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
      Este enlace es de <strong>un solo uso</strong> y expira en breve.
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:${COLORES.textoSuave};">
      Si el botón no funciona, copia este enlace:<br />
      <a href="${escaparHtml(enlace)}" style="color:${COLORES.acento};word-break:break-all;">${escaparHtml(enlace)}</a>
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:${COLORES.textoSuave};">
      Si no solicitaste este cambio, ignora este correo.
    </p>`;

  const texto = `Hola ${datos.nombre},

Recibimos una solicitud para restablecer tu contraseña en UrbanSphere.

Restablecer contraseña: ${enlace}

Este enlace es de un solo uso y expira en breve.

Si no solicitaste esto, ignora este correo.

Saludos,
UrbanSphere`;

  return {
    html: plantillaBase({
      titulo: 'Restablecer contraseña',
      preheader: 'Restablece tu contraseña de UrbanSphere',
      cuerpo,
    }),
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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;background-color:#f8fafc;border:1px solid ${COLORES.borde};border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${COLORES.textoSuave};">Proyecto</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">#${datos.proyectoId}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;">Un agente de UrbanSphere se contactará contigo pronto.</p>`;

  const texto = `Hola ${datos.nombre},

Recibimos tu solicitud de interés en el proyecto #${datos.proyectoId}. Un agente se contactará contigo pronto.

Saludos,
UrbanSphere`;

  return {
    html: plantillaBase({
      titulo: 'Solicitud de interés recibida',
      preheader: `Recibimos tu interés en el proyecto #${datos.proyectoId}`,
      cuerpo,
    }),
    texto,
  };
}
