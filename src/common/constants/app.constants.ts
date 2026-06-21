/**
 * Archivo: app.constants.ts
 * Ubicación: common/constants
 * Tipo: Constantes globales
 * Contenido: rondas bcrypt, nombre de rol por defecto, identificadores de roles del sistema
 */

export const RONDAS_BCRYPT = 10;

export const NOMBRE_ROL_POR_DEFECTO = 'user';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  AGENT: 'agent',
} as const;
