import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsuarioActual } from '../../../common/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CargaJwt } from '../../auth/interfaces/carga-jwt.interface';
import { AgregarFavoritoDto } from '../dto/agregar-favorito.dto';
import {
  RespuestaEsFavoritoDto,
  RespuestaIdsFavoritosDto,
} from '../dto/respuesta-ids-favoritos.dto';
import { RespuestaFavoritoDto } from '../dto/respuesta-favorito.dto';
import { FavoritosServicio } from '../services/favoritos.service';

@ApiTags('Favoritos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favoritos')
export class FavoritosControlador {
  constructor(private readonly favoritosServicio: FavoritosServicio) {}

  @Get('ids')
  @ApiOperation({ summary: 'IDs de proyectos favoritos del usuario (para corazones en el front)' })
  @ApiResponse({ status: 200, type: RespuestaIdsFavoritosDto })
  listarIds(@UsuarioActual() usuarioActual: CargaJwt): Promise<RespuestaIdsFavoritosDto> {
    return this.favoritosServicio.listarIdsFavoritos(usuarioActual);
  }

  @Get('proyecto/:proyectoId')
  @ApiOperation({ summary: 'Comprobar si un proyecto está en favoritos' })
  @ApiResponse({ status: 200, type: RespuestaEsFavoritoDto })
  esFavorito(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @UsuarioActual() usuarioActual: CargaJwt,
  ): Promise<RespuestaEsFavoritoDto> {
    return this.favoritosServicio.esFavorito(proyectoId, usuarioActual);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis proyectos favoritos' })
  @ApiResponse({ status: 200, type: [RespuestaFavoritoDto] })
  listar(@UsuarioActual() usuarioActual: CargaJwt): Promise<RespuestaFavoritoDto[]> {
    return this.favoritosServicio.listarMisFavoritos(usuarioActual);
  }

  @Post()
  @ApiOperation({ summary: 'Marcar proyecto como favorito (corazón)' })
  @ApiResponse({ status: 201, type: RespuestaFavoritoDto })
  agregar(
    @Body() dto: AgregarFavoritoDto,
    @UsuarioActual() usuarioActual: CargaJwt,
  ): Promise<RespuestaFavoritoDto> {
    return this.favoritosServicio.agregarFavorito(dto, usuarioActual);
  }

  @Delete(':proyectoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar proyecto de favoritos' })
  @ApiResponse({ status: 204, description: 'Favorito eliminado' })
  quitar(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @UsuarioActual() usuarioActual: CargaJwt,
  ): Promise<void> {
    return this.favoritosServicio.quitarFavorito(proyectoId, usuarioActual);
  }
}
