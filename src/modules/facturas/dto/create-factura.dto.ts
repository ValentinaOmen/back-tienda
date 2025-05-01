import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateFacturaDetalleDto } from './create-factura-detalle.dto';

export class CreateFacturaDto {
  @IsDateString()
  facFecha: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  facCliente?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  facVendedor?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleDto)
  detalles: CreateFacturaDetalleDto[];
} 