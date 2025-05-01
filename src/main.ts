import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir la comunicación con el frontend
  app.enableCors({
    origin: 'http://localhost:5173', // URL del frontend
    credentials: true
  });
  
  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina las propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los datos recibidos al tipo definido en el DTO
    }),
  );
  
  // Configurar documentación Swagger
  const config = new DocumentBuilder()
    .setTitle('NaturVida API')
    .setDescription('API REST para la gestión de NaturVida')
    .setVersion('1.0')
    .addTag('clientes')
    .addTag('vendedores')
    .addTag('productos')
    .addTag('facturas')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
