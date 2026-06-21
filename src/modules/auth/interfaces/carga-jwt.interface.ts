/**
 * Archivo: carga-jwt.interface.ts
 * Ubicación: modules/auth/interfaces
 * Tipo: Interfaces de autenticación
 * Contenido: estructura del payload JWT y respuesta de tokens generados
 */

export interface CargaJwt {
  sub: number;
  uuid: string;
  email: string;
  rol: string;
}

export interface TokensAutenticacion {
  tokenAcceso: string;
  tokenRefresco: string;
  expiraEn: string;
}
