import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

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
}