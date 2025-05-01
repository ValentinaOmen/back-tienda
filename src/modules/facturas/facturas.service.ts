import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Factura } from './entity/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { FacturaDetalle } from './entity/factura-detalle.entity';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(FacturaDetalle)
    private facturaDetalleRepository: Repository<FacturaDetalle>,
    private dataSource: DataSource,
    private productosService: ProductosService,
  ) {}

  async findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: ['cliente', 'vendedor', 'detalles', 'detalles.producto'],
    });
  }

  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { facNumero: id },
      relations: ['cliente', 'vendedor', 'detalles', 'detalles.producto'],
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    // Usar transacción para garantizar la integridad de los datos
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la factura
      const factura = this.facturaRepository.create({
        facFecha: new Date(createFacturaDto.facFecha),
        facCliente: createFacturaDto.facCliente,
        facVendedor: createFacturaDto.facVendedor,
        facValorTotal: 0, // Lo calcularemos después
      });

      // Guardar la factura para obtener el ID
      const savedFactura = await queryRunner.manager.save(factura);

      let valorTotal = 0;

      // Crear y guardar los detalles
      for (const detalleDto of createFacturaDto.detalles) {
        // Obtener el producto para validar y calcular el valor
        const producto = await this.productosService.findOne(detalleDto.facProducto);

        // Verificar si hay suficiente stock
        if (producto.proCantidad < detalleDto.facCantidad) {
          throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
        }

        // Actualizar el stock
        await this.productosService.updateStock(producto.proCodigo, detalleDto.facCantidad);

        // Crear el detalle
        const detalle = this.facturaDetalleRepository.create({
          facNumero: savedFactura.facNumero,
          facProducto: detalleDto.facProducto,
          facCantidad: detalleDto.facCantidad,
        });

        // Guardar el detalle
        await queryRunner.manager.save(detalle);

        // Sumar al valor total
        valorTotal += producto.proValor * detalleDto.facCantidad;
      }

      // Actualizar el valor total de la factura
      savedFactura.facValorTotal = valorTotal;
      await queryRunner.manager.save(savedFactura);

      await queryRunner.commitTransaction();

      return this.findOne(savedFactura.facNumero);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async update(id: number, createFacturaDto: CreateFacturaDto): Promise<Factura> {
    // Verificar que la factura exista
    await this.findOne(id);
    
    // Primero eliminar la factura antigua y sus detalles
    await this.remove(id);
    
    // Crear una nueva factura con los datos actualizados
    const factura = this.facturaRepository.create({
      facNumero: id, // Mantener el mismo número de factura
      facFecha: new Date(createFacturaDto.facFecha),
      facCliente: createFacturaDto.facCliente,
      facVendedor: createFacturaDto.facVendedor,
      facValorTotal: 0, // Lo calcularemos después
    });
    
    // Usar transacción para garantizar la integridad de los datos
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Guardar la factura
      const savedFactura = await queryRunner.manager.save(factura);
      
      let valorTotal = 0;
      
      // Crear y guardar los detalles
      for (const detalleDto of createFacturaDto.detalles) {
        // Obtener el producto para validar y calcular el valor
        const producto = await this.productosService.findOne(detalleDto.facProducto);
        
        // Verificar si hay suficiente stock
        if (producto.proCantidad < detalleDto.facCantidad) {
          throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
        }
        
        // Actualizar el stock
        await this.productosService.updateStock(producto.proCodigo, detalleDto.facCantidad);
        
        // Crear el detalle
        const detalle = this.facturaDetalleRepository.create({
          facNumero: savedFactura.facNumero,
          facProducto: detalleDto.facProducto,
          facCantidad: detalleDto.facCantidad,
        });
        
        // Guardar el detalle
        await queryRunner.manager.save(detalle);
        
        // Sumar al valor total
        valorTotal += producto.proValor * detalleDto.facCantidad;
      }
      
      // Actualizar el valor total de la factura
      savedFactura.facValorTotal = valorTotal;
      await queryRunner.manager.save(savedFactura);
      
      await queryRunner.commitTransaction();
      
      return this.findOne(savedFactura.facNumero);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const factura = await this.findOne(id);
    await this.facturaRepository.remove(factura);
  }
  
  async getFacturasDetalladas(): Promise<any[]> {
    const query = `
      SELECT f.facNumero, f.facFecha, f.facValorTotal,
             c.clDocumento, c.clNombre as clienteNombre,
             v.venUsuario as vendedorId,
             json_agg(
               json_build_object(
                 'producto', p.proDescripcion,
                 'cantidad', fd.facCantidad,
                 'precioUnitario', p.proValor,
                 'subtotal', (fd.facCantidad * p.proValor)
               )
             ) as productos
      FROM "Facturas" f
      LEFT JOIN "Clientes" c ON f.facCliente = c.clDocumento
      LEFT JOIN "Vendedores" v ON f.facVendedor = v.venUsuario
      LEFT JOIN "FacturaDetalle" fd ON f.facNumero = fd.facNumero
      LEFT JOIN "Productos" p ON fd.facProducto = p.proCodigo
      GROUP BY f.facNumero, f.facFecha, f.facValorTotal, c.clDocumento, c.clNombre, v.venUsuario
      ORDER BY f.facFecha DESC
    `;
    
    return this.facturaRepository.query(query);
  }
  
  async getFacturasByVendedor(vendedorId: number): Promise<any[]> {
    const query = `
      SELECT p.proCodigo, p.proDescripcion, SUM(fd.facCantidad) as unidadesVendidas,
             SUM(fd.facCantidad * p.proValor) as valorTotal
      FROM "Facturas" f
      JOIN "FacturaDetalle" fd ON f.facNumero = fd.facNumero
      JOIN "Productos" p ON fd.facProducto = p.proCodigo
      WHERE f.facVendedor = $1
      GROUP BY p.proCodigo, p.proDescripcion
      ORDER BY unidadesVendidas DESC
    `;
    
    return this.facturaRepository.query(query, [vendedorId]);
  }
} 