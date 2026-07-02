import {
  configurarPlantillasCorreo,
  escaparHtml,
  plantillaRestablecimientoContrasena,
} from './plantilla-correo.util';

describe('plantilla-correo.util', () => {
  beforeEach(() => {
    configurarPlantillasCorreo({ logoUrl: '' });
  });
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
    expect(html).not.toContain('data:image');
    expect(texto).toContain('Juan');
  });

  it('usa URL de logo cuando está configurada', () => {
    configurarPlantillasCorreo({ logoUrl: 'https://urbansphere.cl/logo.png' });
    const { html } = plantillaRestablecimientoContrasena({
      nombre: 'Juan',
      enlace: 'https://urbansphere.cl/restablecer-contrasena?token=abc',
    });

    expect(html).toContain('https://urbansphere.cl/logo.png');
  });
});
