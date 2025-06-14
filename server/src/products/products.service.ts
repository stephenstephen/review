import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductInput: CreateProductInput): Promise<Product> {
    const product = this.productRepository.create(createProductInput);
    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductInput: UpdateProductInput): Promise<Product> {
    const product = await this.findOne(id);

    // Si une nouvelle image est fournie, on supprime l’ancienne
    if (updateProductInput.image && product.image && product.image !== updateProductInput.image) {
      this.deleteImageFile(product.image);
    }

    Object.assign(product, updateProductInput);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<boolean> {
    const product = await this.findOne(id);

    // Supprime le fichier image s’il existe
    if (product.image) {
      this.deleteImageFile(product.image);
    }

    await this.productRepository.remove(product);
    return true;
  }

  private deleteImageFile(filename: string): void {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', filename);
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(uploadPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`❌ Failed to delete image ${filename}:`, unlinkErr);
          } else {
            console.log(`🧹 Image ${filename} deleted`);
          }
        });
      }
    });
  }
}
