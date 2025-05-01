import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Factura } from './factura.entity';
import { Producto } from '../../productos/entity/producto.entity';

@Entity('facturadetalle')
export class FacturaDetalle {
  @PrimaryColumn()
  facNumero: number;

  @PrimaryColumn()
  facProducto: number;

  @Column({ type: 'int', nullable: false })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  facCantidad: number;

  @ManyToOne(() => Factura, factura => factura.detalles, {
    onDelete: 'CASCADE',
  })
  factura: Factura;

  @ManyToOne(() => Producto, producto => producto.detalles, {
    onDelete: 'SET NULL',
  })
  producto: Producto;
}
