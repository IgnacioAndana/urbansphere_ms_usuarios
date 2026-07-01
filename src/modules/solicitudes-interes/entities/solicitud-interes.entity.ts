/**
 * Archivo: solicitud-interes.entity.ts
 * Ubicación: modules/solicitudes-interes/entities
 * Tipo: Entidad TypeORM
 * Tabla BD: solicitudes_interes
 * Contenido: solicitudes "Me interesa este proyecto"
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

@Entity('solicitudes_interes')
export class SolicitudInteresEntidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'proyecto_id', type: 'bigint' })
  proyectoId: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'email', type: 'varchar', length: 150 })
  email: string;

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId: number | null;

  @ManyToOne(() => UsuarioEntidad, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntidad | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  creadoEn: Date;
}
