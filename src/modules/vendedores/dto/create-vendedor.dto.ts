import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVendedorDto {
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @IsNumber({}, { message: 'El usuario debe ser un número' })
  @Type(() => Number)
  venUsuario: number;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  venContrasena: string;
} 