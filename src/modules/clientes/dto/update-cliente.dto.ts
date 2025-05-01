import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  clNombre?: string;

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