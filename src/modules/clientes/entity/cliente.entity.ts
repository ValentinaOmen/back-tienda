import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Factura } from '../../facturas/entity/factura.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('increment')
  clDocumento: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  clNombre: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsOptional()
  clDireccion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  clTelefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo válido' })
  clCorreo: string;

  @OneToMany(() => Factura, factura => factura.cliente)
  facturas: Factura[];
}
