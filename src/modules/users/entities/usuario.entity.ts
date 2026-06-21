/**
 * Archivo: usuario.entity.ts
 * Ubicación: modules/users/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: usuarios
 * Contenido: modelo de usuario con relación a rol y tokens de refresco
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RolEntidad } from '../../roles/entities/rol.entity';
import { TokenRefrescoEntidad } from '../../auth/entities/token-refresco.entity';

@Entity('usuarios')
export class UsuarioEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ name: 'hash_contrasena', type: 'varchar', length: 255 })
  hashContrasena: string;

  @Column({ name: 'rol_id', type: 'bigint' })
  rolId: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  @ManyToOne(() => RolEntidad, (rol) => rol.usuarios, { eager: true })
  @JoinColumn({ name: 'rol_id' })
  rol: RolEntidad;

  @OneToMany(() => TokenRefrescoEntidad, (token) => token.usuario)
  tokensRefresco: TokenRefrescoEntidad[];
}
