/**
 * Archivo: formatear-fecha.util.spec.ts
 * Ubicación: common/utils
 * Tipo: Pruebas unitarias
 * Contenido: validación del formato dd-mm-yyyy HH:mm:ss en respuestas
 */

import {
  formatearFechaRespuesta,
  formatearFechasEnObjeto,
} from './formatear-fecha.util';

describe('formatearFechaRespuesta', () => {
  it('debe formatear Date al formato dd-mm-yyyy HH:mm:ss', () => {
    const fecha = new Date(2025, 5, 20, 14, 30, 45);
    expect(formatearFechaRespuesta(fecha)).toBe('20-06-2025 14:30:45');
  });

  it('debe formatear fechas anidadas en objetos de respuesta', () => {
    const entrada = {
      id: 1,
      creadoEn: new Date(2025, 0, 5, 9, 15, 0),
      actualizadoEn: '2025-01-05T09:15:00.000Z',
    };

    const salida = formatearFechasEnObjeto(entrada);

    expect(typeof salida.creadoEn).toBe('string');
    expect(salida.creadoEn).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/);
    expect(typeof salida.actualizadoEn).toBe('string');
  });
});
