import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { FacturaDetalle } from '../../factura-detalles/entity/factura-detalle.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('increment', { name: 'proCodigo' })
  proCodigo: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  proDescripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  proValor: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 50
  })
  @Column({ type: 'int', nullable: false })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  proCantidad: number;

  @OneToMany(() => FacturaDetalle, detalle => detalle.producto)
  detalles: FacturaDetalle[];
} 