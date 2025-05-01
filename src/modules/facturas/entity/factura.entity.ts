import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Cliente } from '../../clientes/entity/cliente.entity';
import { Vendedor } from '../../vendedores/entity/vendedor.entity';
import { FacturaDetalle } from './factura-detalle.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn('increment')
  facNumero: number;

  @Column({ type: 'date', nullable: false })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  facFecha: Date;

  @Column({ type: 'int', nullable: true })
  facCliente: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  @IsNotEmpty({ message: 'El valor total es obligatorio' })
  @Min(0, { message: 'El valor total no puede ser negativo' })
  facValorTotal: number;

  @Column({ type: 'int', nullable: true })
  facVendedor: number;

  @ManyToOne(() => Cliente, cliente => cliente.facturas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'facCliente' })
  cliente: Cliente;

  @ManyToOne(() => Vendedor, vendedor => vendedor.facturas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'facVendedor' })
  vendedor: Vendedor;

  @OneToMany(() => FacturaDetalle, detalle => detalle.factura, {
    cascade: true,
  })
  detalles: FacturaDetalle[];
} 