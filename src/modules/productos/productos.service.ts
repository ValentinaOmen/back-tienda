import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entity/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productoRepository.find();
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({ 
      where: { proCodigo: id },
      relations: ['detalles']
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(producto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    this.productoRepository.merge(producto, updateProductoDto);
    return this.productoRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
  }
  
  async updateStock(id: number, cantidad: number): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.proCantidad = producto.proCantidad - cantidad;
    if (producto.proCantidad < 0) {
      throw new Error('No hay suficiente stock');
    }
    return this.productoRepository.save(producto);
  }
  
  async getTopVendidos(): Promise<any[]> {
    // Consulta para obtener los 5 productos más vendidos
    const query = `
      SELECT p."proCodigo", p."proDescripcion", p."proValor", 
             SUM(fd."facCantidad") as unidadesVendidas,
             p."proCantidad" as stockDisponible
      FROM "productos" p
      JOIN "facturadetalle" fd ON p."proCodigo" = fd."facProducto"
      GROUP BY p."proCodigo", p."proDescripcion", p."proValor", p."proCantidad"
      ORDER BY unidadesVendidas DESC
      LIMIT 5
    `;
    
    return this.productoRepository.query(query);
  }
  
  async getProductosConDetalle(): Promise<any[]> {
    // Consulta para obtener todos los productos con detalle de ventas
    const query = `
      SELECT p."proCodigo", p."proDescripcion", p."proValor", p."proCantidad" as stockDisponible,
             COALESCE(SUM(fd."facCantidad"), 0) as unidadesVendidas
      FROM "productos" p
      LEFT JOIN "facturadetalle" fd ON p."proCodigo" = fd."facProducto"
      GROUP BY p."proCodigo", p."proDescripcion", p."proValor", p."proCantidad"
      ORDER BY p."proCodigo"
    `;
    
    return this.productoRepository.query(query);
  }
} 