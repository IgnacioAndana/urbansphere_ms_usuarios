/**
 * Entidad: proyectos_favoritos
 * Favoritos del usuario (corazón en el front). Referencia proyectos.id
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsuarioEntidad } from '../../users/entities/usuario.entity';

@Entity('proyectos_favoritos')
export class ProyectoFavoritoEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: number;

  @Column({ name: 'proyecto_id', type: 'bigint' })
  proyectoId: number;

  @ManyToOne(() => UsuarioEntidad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntidad;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  creadoEn: Date;
}
