/**
 * Archivo: roles.decorator.ts
 * Ubicación: common/decorators
 * Tipo: Decorador de metadatos
 * Contenido: define qué roles pueden acceder a un endpoint
 */

import { SetMetadata } from '@nestjs/common';

export const ROLES_CLAVE = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_CLAVE, roles);
