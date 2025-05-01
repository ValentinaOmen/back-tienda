import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  proDescripcion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Type(() => Number)
  proValor?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Type(() => Number)
  proCantidad?: number;
} 