import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from './entity/vendedor.entity';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';

@Injectable()
export class VendedoresService {
  constructor(
    @InjectRepository(Vendedor)
    private vendedorRepository: Repository<Vendedor>,
  ) {}

  async findAll(): Promise<Vendedor[]> {
    return this.vendedorRepository.find();
  }

  async findOne(id: number): Promise<Vendedor> {
    const vendedor = await this.vendedorRepository.findOne({ 
      where: { venUsuario: id },
      relations: ['facturas']
    });
    if (!vendedor) {
      throw new NotFoundException(`Vendedor con ID ${id} no encontrado`);
    }
    return vendedor;
  }

  async create(createVendedorDto: CreateVendedorDto): Promise<Vendedor> {
    // Verificar si ya existe un vendedor con ese ID
    const existingVendedor = await this.vendedorRepository.findOne({
      where: { venUsuario: createVendedorDto.venUsuario }
    });
    
    if (existingVendedor) {
      throw new ConflictException(`Ya existe un vendedor con el ID ${createVendedorDto.venUsuario}`);
    }
    
    const vendedor = this.vendedorRepository.create(createVendedorDto);
    return this.vendedorRepository.save(vendedor);
  }

  async update(id: number, updateVendedorDto: UpdateVendedorDto): Promise<Vendedor> {
    const vendedor = await this.findOne(id);
    this.vendedorRepository.merge(vendedor, updateVendedorDto);
    return this.vendedorRepository.save(vendedor);
  }

  async remove(id: number): Promise<void> {
    const vendedor = await this.findOne(id);
    await this.vendedorRepository.remove(vendedor);
  }
} 