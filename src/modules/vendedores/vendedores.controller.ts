import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { Vendedor } from './entity/vendedor.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly vendedoresService: VendedoresService) {}

  @Post('crear')
  create(@Body() createVendedorDto: CreateVendedorDto): Promise<Vendedor> {
    return this.vendedoresService.create(createVendedorDto);
  }

  @Get()
  findAll(): Promise<Vendedor[]> {
    return this.vendedoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vendedor> {
    return this.vendedoresService.findOne(id);
  }

  @Patch('actualizar/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendedorDto: UpdateVendedorDto,
  ): Promise<Vendedor> {
    return this.vendedoresService.update(id, updateVendedorDto);
  }

  @Delete('eliminar/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vendedoresService.remove(id);
  }
} 