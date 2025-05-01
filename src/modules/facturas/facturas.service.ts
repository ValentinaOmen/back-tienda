import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Factura } from './entity/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { FacturaDetallesService } from '../factura-detalles/factura-detalles.service';
import { ProductosService } from '../productos/productos.service';
import { FacturaWithDetallesDto } from './dto/factura-with-detalles.dto';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    private dataSource: DataSource,
    private facturaDetallesService: FacturaDetallesService,
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

  async createSimple(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const factura = this.facturaRepository.create({
      facFecha: new Date(createFacturaDto.facFecha),
      facCliente: createFacturaDto.facCliente,
      facVendedor: createFacturaDto.facVendedor,
      facValorTotal: 0, // Valor inicial
    });

    return this.facturaRepository.save(factura);
  }

  async createWithDetalles(facturaWithDetallesDto: FacturaWithDetallesDto): Promise<Factura> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const factura = this.facturaRepository.create({
        facFecha: new Date(facturaWithDetallesDto.facFecha),
        facCliente: facturaWithDetallesDto.facCliente,
        facVendedor: facturaWithDetallesDto.facVendedor,
        facValorTotal: 0, // Lo calcularemos después
      });

      const savedFactura = await queryRunner.manager.save(factura);

      let valorTotal = 0;

      for (const detalleDto of facturaWithDetallesDto.detalles) {
        const producto = await this.productosService.findOne(detalleDto.facProducto);

        if (producto.proCantidad < detalleDto.facCantidad) {
          throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
        }

        await this.productosService.updateStock(producto.proCodigo, detalleDto.facCantidad);

        await this.facturaDetallesService.create(savedFactura.facNumero, detalleDto);

        valorTotal += producto.proValor * detalleDto.facCantidad;
      }

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

  async updateSimple(id: number, createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({ where: { facNumero: id } });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    
    factura.facFecha = new Date(createFacturaDto.facFecha);
    factura.facCliente = createFacturaDto.facCliente as number;
    factura.facVendedor = createFacturaDto.facVendedor as number;

    return this.facturaRepository.save(factura);
  }

  async updateWithDetalles(id: number, facturaWithDetallesDto: FacturaWithDetallesDto): Promise<Factura> {
    await this.findOne(id);

    await this.facturaDetallesService.removeAllByFacturaId(id);

    const factura = await this.facturaRepository.findOne({ where: { facNumero: id } });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    
    factura.facFecha = new Date(facturaWithDetallesDto.facFecha);
    factura.facCliente = facturaWithDetallesDto.facCliente as number;
    factura.facVendedor = facturaWithDetallesDto.facVendedor as number;
    factura.facValorTotal = 0; // Lo calcularemos después

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedFactura = await queryRunner.manager.save(factura);

      let valorTotal = 0;

      for (const detalleDto of facturaWithDetallesDto.detalles) {
        const producto = await this.productosService.findOne(detalleDto.facProducto);

        if (producto.proCantidad < detalleDto.facCantidad) {
          throw new BadRequestException(`No hay suficiente stock del producto ${producto.proDescripcion}`);
        }

        await this.productosService.updateStock(producto.proCodigo, detalleDto.facCantidad);

        await this.facturaDetallesService.create(savedFactura.facNumero, detalleDto);

        valorTotal += producto.proValor * detalleDto.facCantidad;
      }

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
    await this.facturaDetallesService.removeAllByFacturaId(id);

    const factura = await this.facturaRepository.findOne({ where: { facNumero: id } });
    if (factura) {
      await this.facturaRepository.remove(factura);
    }
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