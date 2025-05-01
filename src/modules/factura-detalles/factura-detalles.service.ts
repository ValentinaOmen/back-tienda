import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaDetalle } from './entity/factura-detalle.entity';
import { CreateFacturaDetalleDto } from './dto/create-factura-detalle.dto';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class FacturaDetallesService {
  constructor(
    @InjectRepository(FacturaDetalle)
    private facturaDetalleRepository: Repository<FacturaDetalle>,
    private productosService: ProductosService,
  ) {}

  async findAll(): Promise<FacturaDetalle[]> {
    return this.facturaDetalleRepository.find({
      relations: ['factura', 'producto'],
    });
  }

  async findByFacturaId(facturaId: number): Promise<FacturaDetalle[]> {
    return this.facturaDetalleRepository.find({
      where: { facNumero: facturaId },
      relations: ['producto'],
    });
  }

  async findOne(facturaId: number, productoId: number): Promise<FacturaDetalle> {
    const detalle = await this.facturaDetalleRepository.findOne({
      where: { 
        facNumero: facturaId,
        facProducto: productoId 
      },
      relations: ['factura', 'producto'],
    });
    
    if (!detalle) {
      throw new NotFoundException(`Detalle de factura con ID ${facturaId}-${productoId} no encontrado`);
    }
    
    return detalle;
  }

  async create(facturaId: number, createFacturaDetalleDto: CreateFacturaDetalleDto): Promise<FacturaDetalle> {
    // Obtener el producto para validar y calcular el valor
    const producto = await this.productosService.findOne(createFacturaDetalleDto.facProducto);

    // Verificar si hay suficiente stock
    if (producto.proCantidad < createFacturaDetalleDto.facCantidad) {
      throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
    }

    // Actualizar el stock
    await this.productosService.updateStock(producto.proCodigo, createFacturaDetalleDto.facCantidad);

    // Crear el detalle
    const detalle = this.facturaDetalleRepository.create({
      facNumero: facturaId,
      facProducto: createFacturaDetalleDto.facProducto,
      facCantidad: createFacturaDetalleDto.facCantidad,
    });

    // Guardar el detalle
    return this.facturaDetalleRepository.save(detalle);
  }

  async update(facturaId: number, productoId: number, createFacturaDetalleDto: CreateFacturaDetalleDto): Promise<FacturaDetalle> {
    // Verificar que el detalle exista
    await this.findOne(facturaId, productoId);
    
    // Obtener el producto para validar y calcular el valor
    const producto = await this.productosService.findOne(createFacturaDetalleDto.facProducto);

    // Verificar si hay suficiente stock
    if (producto.proCantidad < createFacturaDetalleDto.facCantidad) {
      throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
    }

    // Actualizar el stock
    await this.productosService.updateStock(producto.proCodigo, createFacturaDetalleDto.facCantidad);

    // Actualizar el detalle
    await this.facturaDetalleRepository.update(
      { facNumero: facturaId, facProducto: productoId },
      { facCantidad: createFacturaDetalleDto.facCantidad }
    );

    return this.findOne(facturaId, productoId);
  }

  async remove(facturaId: number, productoId: number): Promise<void> {
    const detalle = await this.findOne(facturaId, productoId);
    await this.facturaDetalleRepository.remove(detalle);
  }

  async removeAllByFacturaId(facturaId: number): Promise<void> {
    const detalles = await this.findByFacturaId(facturaId);
    await this.facturaDetalleRepository.remove(detalles);
  }

  // Método para calcular el valor total de los detalles de una factura
  async calcularValorTotal(facturaId: number): Promise<number> {
    const detalles = await this.findByFacturaId(facturaId);
    let valorTotal = 0;
    
    for (const detalle of detalles) {
      const producto = await this.productosService.findOne(detalle.facProducto);
      valorTotal += producto.proValor * detalle.facCantidad;
    }
    
    return valorTotal;
  }
}
