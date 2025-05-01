import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaDetalle } from './entity/factura-detalle.entity';
import { FacturaDetallesController } from './factura-detalles.controller';
import { FacturaDetallesService } from './factura-detalles.service';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacturaDetalle]),
    ProductosModule
  ],
  controllers: [FacturaDetallesController],
  providers: [FacturaDetallesService],
  exports: [FacturaDetallesService]
})
export class FacturaDetallesModule {}
