/**
 * Archivo: permiso.entity.ts
 * Ubicación: modules/permissions/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: permisos
 * Contenido: permisos granulares asignables a roles
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { RolEntidad } from '../../roles/entities/rol.entity';

@Entity('permisos')
export class PermisoEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;

  @ManyToMany(() => RolEntidad, (rol) => rol.permisos)
  roles: RolEntidad[];
}
