import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ 
    description: 'Descripción del producto',
    example: 'Crema facial hidratante'
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  proDescripcion: string;

  @ApiProperty({ 
    description: 'Valor unitario del producto',
    example: 25000,
    minimum: 0
  })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Type(() => Number)
  proValor: number;

  @ApiProperty({ 
    description: 'Cantidad disponible en inventario',
    example: 50,
    minimum: 0
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Type(() => Number)
  proCantidad: number;
} 