import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VendedoresService } from '../vendedores/vendedores.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private vendedoresService: VendedoresService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { venUsuario, venContrasena } = loginDto;
    try {
      const vendedor = await this.vendedoresService.findOne(+venUsuario);
      
      // En una aplicación real, deberías hashear las contraseñas y comparar los hashes
      if (vendedor.venContrasena !== venContrasena) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      
      const payload = {
        venUsuario: vendedor.venUsuario.toString(),
        // No incluir la contraseña en el token por seguridad
      };
      
      return {
        token: this.jwtService.sign(payload),
        usuario: vendedor.venUsuario,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
} 