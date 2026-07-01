/**
 * Archivo: rol.entity.ts
 * Ubicación: modules/roles/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: roles
 * Contenido: roles del sistema (admin, user, agent)
 */

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UsuarioEntidad } from '../../users/entities/usuario.entity';

@Entity('roles')
export class RolEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @OneToMany(() => UsuarioEntidad, (usuario) => usuario.rol)
  usuarios: UsuarioEntidad[];
}
