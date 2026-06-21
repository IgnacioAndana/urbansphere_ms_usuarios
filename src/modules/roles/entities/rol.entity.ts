/**
 * Archivo: rol.entity.ts
 * Ubicación: modules/roles/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: roles, rol_permisos
 * Contenido: roles del sistema y relación many-to-many con permisos
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UsuarioEntidad } from '../../users/entities/usuario.entity';
import { PermisoEntidad } from '../../permissions/entities/permiso.entity';

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

  @ManyToMany(() => PermisoEntidad, (permiso) => permiso.roles, { eager: true })
  @JoinTable({
    name: 'rol_permisos',
    joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
  })
  permisos: PermisoEntidad[];
}
