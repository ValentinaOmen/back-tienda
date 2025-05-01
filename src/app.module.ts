import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VendedoresModule } from './modules/vendedores/vendedores.module';
import { ProductosModule } from './modules/productos/productos.module';
import { FacturasModule } from './modules/facturas/facturas.module';
import { FacturaDetallesModule } from './modules/factura-detalles/factura-detalles.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Activar temporalmente para crear las tablas
      }),
    }),
    ClientesModule,
    VendedoresModule,
    ProductosModule,
    FacturasModule,
    FacturaDetallesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
