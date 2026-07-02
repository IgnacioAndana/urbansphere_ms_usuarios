import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritosControlador } from './controllers/favoritos.controller';
import { ProyectoFavoritoEntidad } from './entities/proyecto-favorito.entity';
import { FavoritosRepositorio } from './repositories/favoritos.repository';
import { FavoritosServicio } from './services/favoritos.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProyectoFavoritoEntidad])],
  controllers: [FavoritosControlador],
  providers: [FavoritosServicio, FavoritosRepositorio],
})
export class FavoritosModule {}
