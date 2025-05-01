import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @IsString()
  venUsuario: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  venContrasena: string;
}
