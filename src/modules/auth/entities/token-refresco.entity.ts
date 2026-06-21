/**
 * Archivo: token-refresco.entity.ts
 * Ubicación: modules/auth/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: tokens_refresco
 * Contenido: tokens de refresco JWT asociados a un usuario
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsuarioEntidad } from '../../users/entities/usuario.entity';

@Entity('tokens_refresco')
export class TokenRefrescoEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ name: 'expira_en', type: 'datetime' })
  expiraEn: Date;

  @ManyToOne(() => UsuarioEntidad, (usuario) => usuario.tokensRefresco, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntidad;
}
