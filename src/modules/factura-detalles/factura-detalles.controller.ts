import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { FacturaDetallesService } from './factura-detalles.service';
import { CreateFacturaDetalleDto } from './dto/create-factura-detalle.dto';
import { FacturaDetalle } from './entity/factura-detalle.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('factura-detalles')
export class FacturaDetallesController {
  constructor(private readonly facturaDetallesService: FacturaDetallesService) {}

  @Get()
  findAll(): Promise<FacturaDetalle[]> {
    return this.facturaDetallesService.findAll();
  }

  @Get('factura/:facturaId')
  findByFacturaId(@Param('facturaId', ParseIntPipe) facturaId: number): Promise<FacturaDetalle[]> {
    return this.facturaDetallesService.findByFacturaId(facturaId);
  }

  @Get(':facturaId/:productoId')
  findOne(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Param('productoId', ParseIntPipe) productoId: number
  ): Promise<FacturaDetalle> {
    return this.facturaDetallesService.findOne(facturaId, productoId);
  }

  @Post('factura/:facturaId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Body() createFacturaDetalleDto: CreateFacturaDetalleDto
  ): Promise<FacturaDetalle> {
    return this.facturaDetallesService.create(facturaId, createFacturaDetalleDto);
  }

  @Patch(':facturaId/:productoId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() createFacturaDetalleDto: CreateFacturaDetalleDto
  ): Promise<FacturaDetalle> {
    return this.facturaDetallesService.update(facturaId, productoId, createFacturaDetalleDto);
  }

  @Delete(':facturaId/:productoId')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Param('productoId', ParseIntPipe) productoId: number
  ): Promise<void> {
    return this.facturaDetallesService.remove(facturaId, productoId);
  }

  @Delete('factura/:facturaId')
  @UseGuards(JwtAuthGuard)
  removeAllByFacturaId(
    @Param('facturaId', ParseIntPipe) facturaId: number
  ): Promise<void> {
    return this.facturaDetallesService.removeAllByFacturaId(facturaId);
  }
}
