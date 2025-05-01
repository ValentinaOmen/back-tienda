import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Factura } from '../../facturas/entity/factura.entity';

@Entity('vendedores')
export class Vendedor {
  @PrimaryColumn()
  @IsNotEmpty({ message: 'El usuario es obligatorio' }) 
  venUsuario: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  venContrasena: string;

  @OneToMany(() => Factura, factura => factura.vendedor)
  facturas: Factura[];
} 