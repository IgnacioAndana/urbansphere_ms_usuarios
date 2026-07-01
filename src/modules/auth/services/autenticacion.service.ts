/**
 * Archivo: autenticacion.service.ts
 * Ubicación: modules/auth/services
 * Tipo: Servicio de negocio
 * Métodos: iniciarSesion, refrescarToken, cerrarSesion, validarUsuario,
 * solicitarRestablecimiento, validarTokenRestablecimiento, restablecerContrasena
 */

import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RONDAS_BCRYPT } from '../../../common/constants/app.constants';
import { CorreoServicio } from '../../../common/services/correo.service';
import { ExcepcionNegocio } from '../../../common/exceptions/excepcion-negocio.exception';
import { IniciarSesionDto, RefrescarTokenDto } from '../dto/iniciar-sesion.dto';
import {
  RestablecerContrasenaDto,
  SolicitarRestablecimientoDto,
  ValidarTokenRestablecimientoDto,
} from '../dto/restablecer-contrasena.dto';
import { CargaJwt, TokensAutenticacion } from '../interfaces/carga-jwt.interface';
import { TokensRefrescoRepositorio } from '../repositories/tokens-refresco.repository';
import { TokensRestablecimientoRepositorio } from '../repositories/tokens-restablecimiento.repository';
import { UsuariosRepositorio } from '../../users/repositories/usuarios.repository';
import { RespuestaUsuarioDto } from '../../users/dto/respuesta-usuario.dto';
import { UsuariosServicio } from '../../users/services/usuarios.service';

@Injectable()
export class AutenticacionServicio {
  constructor(
    private readonly usuariosRepositorio: UsuariosRepositorio,
    private readonly usuariosServicio: UsuariosServicio,
    private readonly tokensRefrescoRepositorio: TokensRefrescoRepositorio,
    private readonly tokensRestablecimientoRepositorio: TokensRestablecimientoRepositorio,
    private readonly correoServicio: CorreoServicio,
    private readonly jwtServicio: JwtService,
    private readonly configServicio: ConfigService,
  ) {}

  async iniciarSesion(
    dto: IniciarSesionDto,
  ): Promise<TokensAutenticacion & { usuario: RespuestaUsuarioDto }> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorEmail(dto.email);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.hashContrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generarTokens(
      usuario.id,
      usuario.uuid,
      usuario.email,
      usuario.rol.nombre,
    );

    return {
      ...tokens,
      usuario: this.usuariosServicio.mapearARespuesta(usuario),
    };
  }

  async refrescarToken(dto: RefrescarTokenDto): Promise<TokensAutenticacion> {
    const almacenado = await this.tokensRefrescoRepositorio.buscarPorToken(dto.tokenRefresco);

    if (!almacenado || almacenado.expiraEn < new Date()) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    const usuario = almacenado.usuario;
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    await this.tokensRefrescoRepositorio.eliminarPorToken(dto.tokenRefresco);

    return this.generarTokens(usuario.id, usuario.uuid, usuario.email, usuario.rol.nombre);
  }

  async cerrarSesion(tokenRefresco: string): Promise<void> {
    await this.tokensRefrescoRepositorio.eliminarPorToken(tokenRefresco);
  }

  async validarUsuario(carga: CargaJwt): Promise<CargaJwt> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorId(carga.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return carga;
  }

  async solicitarRestablecimiento(
    dto: SolicitarRestablecimientoDto,
  ): Promise<{ mensaje: string; email: string }> {
    const usuario = await this.usuariosRepositorio.buscarUsuarioPorEmail(dto.email);

    if (!usuario || !usuario.activo) {
      throw new ExcepcionNegocio(
        'No existe una cuenta activa con ese correo electrónico',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.tokensRestablecimientoRepositorio.invalidarPendientesPorUsuario(usuario.id);

    const token = randomBytes(64).toString('hex');
    const expiracion =
      this.configServicio.get<string>('app.passwordResetExpiresIn') || '1h';
    const expiraEn = this.calcularFechaExpiracion(expiracion);

    await this.tokensRestablecimientoRepositorio.crearToken({
      usuarioId: usuario.id,
      token,
      expiraEn,
      usado: false,
    });

    const frontendUrl = this.configServicio.get<string>('app.frontendUrl') || 'http://localhost:5173';
    const ruta = this.configServicio.get<string>('app.passwordResetPath') || '/restablecer-contrasena';
    const enlace = `${frontendUrl}${ruta}?token=${token}`;

    const correoEnviado = await this.correoServicio.enviarRestablecimientoContrasena({
      nombre: usuario.nombre,
      email: usuario.email,
      enlace,
    });

    if (!correoEnviado) {
      await this.tokensRestablecimientoRepositorio.eliminarPorToken(token);
      throw new ExcepcionNegocio(
        'No se pudo enviar el correo. Verifica BREVO_API_KEY y MAIL_FROM verificado en Brevo.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      mensaje: 'Se envió un enlace de restablecimiento a tu correo electrónico',
      email: usuario.email,
    };
  }

  async validarTokenRestablecimiento(
    dto: ValidarTokenRestablecimientoDto,
  ): Promise<{ valido: boolean; expiraEn: Date | null }> {
    const registro = await this.tokensRestablecimientoRepositorio.buscarPorToken(dto.token);
    const valido = this.esTokenRestablecimientoValido(registro);

    return {
      valido,
      expiraEn: valido ? registro!.expiraEn : null,
    };
  }

  async restablecerContrasena(
    dto: RestablecerContrasenaDto,
  ): Promise<{ mensaje: string }> {
    const registro = await this.tokensRestablecimientoRepositorio.buscarPorToken(dto.token);

    if (!this.esTokenRestablecimientoValido(registro)) {
      throw new ExcepcionNegocio(
        'El enlace de restablecimiento es inválido, expiró o ya fue utilizado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashContrasena = await bcrypt.hash(dto.contrasena, RONDAS_BCRYPT);

    await this.usuariosRepositorio.actualizarUsuario(registro!.usuarioId, {
      hashContrasena,
    });

    await this.tokensRestablecimientoRepositorio.marcarComoUsado(registro!.id);
    await this.tokensRefrescoRepositorio.eliminarPorUsuarioId(registro!.usuarioId);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  private esTokenRestablecimientoValido(
    registro: Awaited<ReturnType<TokensRestablecimientoRepositorio['buscarPorToken']>>,
  ): boolean {
    return Boolean(registro && !registro.usado && registro.expiraEn > new Date());
  }

  private async generarTokens(
    usuarioId: number,
    uuid: string,
    email: string,
    rol: string,
  ): Promise<TokensAutenticacion> {
    const carga: CargaJwt = { sub: usuarioId, uuid, email, rol };

    const expiraEn = this.configServicio.get<string>('jwt.accessExpiresIn') || '15m';
    const tokenAcceso = this.jwtServicio.sign(carga, { expiresIn: expiraEn });

    const tokenRefresco = randomBytes(64).toString('hex');
    const expiracionRefresco =
      this.configServicio.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiraEnFecha = this.calcularFechaExpiracion(expiracionRefresco);

    await this.tokensRefrescoRepositorio.crearTokenRefresco({
      usuarioId,
      token: tokenRefresco,
      expiraEn: expiraEnFecha,
    });

    return { tokenAcceso, tokenRefresco, expiraEn };
  }

  private calcularFechaExpiracion(duracion: string): Date {
    const coincidencia = duracion.match(/^(\d+)([dhms])$/);
    if (!coincidencia) {
      throw new ExcepcionNegocio('Formato de expiración de token inválido');
    }

    const valor = parseInt(coincidencia[1], 10);
    const unidad = coincidencia[2];
    const ahora = new Date();

    switch (unidad) {
      case 'd':
        ahora.setDate(ahora.getDate() + valor);
        break;
      case 'h':
        ahora.setHours(ahora.getHours() + valor);
        break;
      case 'm':
        ahora.setMinutes(ahora.getMinutes() + valor);
        break;
      case 's':
        ahora.setSeconds(ahora.getSeconds() + valor);
        break;
    }

    return ahora;
  }
}
