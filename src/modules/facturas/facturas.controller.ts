import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entity/factura.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto): Promise<Factura> {
    return this.facturasService.create(createFacturaDto);
  }

  @Post('crear')
  @UseGuards(JwtAuthGuard)
  createSecured(@Body() createFacturaDto: CreateFacturaDto): Promise<Factura> {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  findAll(): Promise<Factura[]> {// Verificar si hay suficiente stock
/*   if (producto.proCantidad < detalleDto.facCantidad) {
    throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
  } */
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
    return this.facturasService.update(id, updateFacturaDto);
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