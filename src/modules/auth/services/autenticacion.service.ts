/**
 * Archivo: autenticacion.service.ts
 * Ubicación: modules/auth/services
 * Tipo: Servicio de negocio
 * Métodos: iniciarSesion, refrescarToken, cerrarSesion, validarUsuario
 */

import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ExcepcionNegocio } from '../../../common/exceptions/excepcion-negocio.exception';
import { IniciarSesionDto, RefrescarTokenDto } from '../dto/iniciar-sesion.dto';
import { CargaJwt, TokensAutenticacion } from '../interfaces/carga-jwt.interface';
import { TokensRefrescoRepositorio } from '../repositories/tokens-refresco.repository';
import { UsuariosRepositorio } from '../../users/repositories/usuarios.repository';
import { RespuestaUsuarioDto } from '../../users/dto/respuesta-usuario.dto';
import { UsuariosServicio } from '../../users/services/usuarios.service';

@Injectable()
export class AutenticacionServicio {
  constructor(
    private readonly usuariosRepositorio: UsuariosRepositorio,
    private readonly usuariosServicio: UsuariosServicio,
    private readonly tokensRefrescoRepositorio: TokensRefrescoRepositorio,
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
