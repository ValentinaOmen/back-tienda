import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  clNombre: string;

  @IsOptional()
  @IsString()
  clDireccion?: string;

  @IsOptional()
  @IsString()
  clTelefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo válido' })
  clCorreo?: string;
} 