/**
 * Archivo: formatear-fecha.util.ts
 * Ubicación: common/utils
 * Tipo: Utilidad
 * Contenido: formateo de fechas para respuestas API (dd-mm-yyyy HH:mm:ss)
 *
 * BD MySQL almacena en formato nativo: yyyy-mm-dd HH:mm:ss
 */

const PATRON_ISO = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/;

export function formatearFechaRespuesta(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  return `${dia}-${mes}-${anio} ${horas}:${minutos}:${segundos}`;
}

export function esValorFecha(valor: unknown): valor is Date | string {
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return true;
  }
  if (typeof valor === 'string' && PATRON_ISO.test(valor)) {
    return !isNaN(new Date(valor).getTime());
  }
  return false;
}

export function convertirAFecha(valor: Date | string): Date {
  return valor instanceof Date ? valor : new Date(valor);
}

export function formatearFechasEnObjeto<T>(dato: T): T {
  if (dato === null || dato === undefined) {
    return dato;
  }

  if (esValorFecha(dato)) {
    return formatearFechaRespuesta(convertirAFecha(dato)) as T;
  }

  if (Array.isArray(dato)) {
    return dato.map((item) => formatearFechasEnObjeto(item)) as T;
  }

  if (typeof dato === 'object') {
    const resultado: Record<string, unknown> = {};
    for (const [clave, valor] of Object.entries(dato as Record<string, unknown>)) {
      resultado[clave] = formatearFechasEnObjeto(valor);
    }
    return resultado as T;
  }

  return dato;
}
