import { escaparHtml, plantillaRestablecimientoContrasena } from './plantilla-correo.util';

describe('plantilla-correo.util', () => {
  it('escapa caracteres HTML en el nombre', () => {
    expect(escaparHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('genera plantilla de restablecimiento con botón y enlace', () => {
    const { html, texto } = plantillaRestablecimientoContrasena({
      nombre: 'Juan',
      enlace: 'https://urbansphere.cl/restablecer-contrasena?token=abc',
    });

    expect(html).toContain('Restablecer contraseña');
    expect(html).toContain('https://urbansphere.cl/restablecer-contrasena?token=abc');
    expect(html).toContain('UrbanSphere');
    expect(texto).toContain('Juan');
  });
});
