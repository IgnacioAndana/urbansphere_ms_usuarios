/**
 * Archivo: token-restablecimiento.entity.ts
 * Ubicación: modules/auth/entities
 * Tabla BD: tokens_restablecimiento
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UsuarioEntidad } from '../../users/entities/usuario.entity';

@Entity('tokens_restablecimiento')
export class TokenRestablecimientoEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 128, unique: true })
  token: string;

  @Column({ name: 'expira_en', type: 'datetime', precision: 0 })
  expiraEn: Date;

  @Column({ name: 'usado', type: 'tinyint', width: 1, default: 0 })
  usado: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  creadoEn: Date;

  @ManyToOne(() => UsuarioEntidad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntidad;
}
