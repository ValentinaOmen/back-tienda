import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateVendedorDto {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  venContrasena?: string;
} 