import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entity/factura.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FacturaWithDetallesDto } from './dto/factura-with-detalles.dto';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto): Promise<Factura> {
    return this.facturasService.createSimple(createFacturaDto);
  }

  @Post('con-detalles')
  createWithDetalles(@Body() facturaWithDetallesDto: FacturaWithDetallesDto): Promise<Factura> {
    return this.facturasService.createWithDetalles(facturaWithDetallesDto);
  }

  @Post('crear')
  @UseGuards(JwtAuthGuard)
  createSecured(@Body() createFacturaDto: CreateFacturaDto): Promise<Factura> {
    return this.facturasService.createSimple(createFacturaDto);
  }

  @Post('crear-con-detalles')
  @UseGuards(JwtAuthGuard)
  createSecuredWithDetalles(@Body() facturaWithDetallesDto: FacturaWithDetallesDto): Promise<Factura> {
    return this.facturasService.createWithDetalles(facturaWithDetallesDto);
  }

  @Get()
  findAll(): Promise<Factura[]> {
    return this.facturasService.findAll();
  }

  @Get('detalladas')
  getFacturasDetalladas() {
    return this.facturasService.getFacturasDetalladas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Factura> {
    return this.facturasService.findOne(id);
  }

  @Patch('actualizar/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: CreateFacturaDto,
  ) {
    return this.facturasService.updateSimple(id, updateFacturaDto);
  }

  @Patch('actualizar-con-detalles/:id')
  @UseGuards(JwtAuthGuard)
  updateWithDetalles(
    @Param('id', ParseIntPipe) id: number,
    @Body() facturaWithDetallesDto: FacturaWithDetallesDto,
  ) {
    return this.facturasService.updateWithDetalles(id, facturaWithDetallesDto);
  }

  @Delete('eliminar/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.facturasService.remove(id);
  }
  
  @Get('vendedor/:id')
  @UseGuards(JwtAuthGuard)
  getFacturasByVendedor(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.getFacturasByVendedor(id);
  }
}