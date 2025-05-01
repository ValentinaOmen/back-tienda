import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { VendedoresService } from '../../vendedores/vendedores.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private vendedoresService: VendedoresService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'hard!to-guess_secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const { venUsuario } = payload;
      
      if (!venUsuario) {
        throw new UnauthorizedException('Token inválido: falta identificador de usuario');
      }
      
      // Convertir a número asegurándonos que sea un número válido
      const userId = parseInt(venUsuario, 10);
      
      if (isNaN(userId)) {
        throw new UnauthorizedException('Token inválido: identificador de usuario no válido');
      }
      
      const vendedor = await this.vendedoresService.findOne(userId);

      if (!vendedor) {
        throw new UnauthorizedException('Token inválido: usuario no encontrado');
      }

      return vendedor;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
} 