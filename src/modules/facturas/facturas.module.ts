import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entity/factura.entity';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { ProductosModule } from '../productos/productos.module';
import { FacturaDetallesModule } from '../factura-detalles/factura-detalles.module';


//nose que hacer 
@Module({
  imports: [
    TypeOrmModule.forFeature([Factura]),
    ProductosModule,
    FacturaDetallesModule
  ],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService]
})
export class FacturasModule {}
