import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFacturaDetalleDto {
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  @IsNumber({}, { message: 'El producto debe ser un ID válido' })
  @Type(() => Number)
  facProducto: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  facCantidad: number;
} 