import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationArgs } from '../common/dto/pagination-args.dto';
import { PaginationMeta } from '@/common/dto/paginated-response.dto';

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

  async findAll(
    paginationArgs: PaginationArgs,
  ): Promise<{ items: Product[]; meta: PaginationMeta }> {
    const { page, limit, search } = paginationArgs;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'review')
      .loadRelationCountAndMap('product.reviewsCount', 'product.reviews')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .groupBy('product.id');

    if (search) {
      query.where('product.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const itemCount = items.length;

    const meta: PaginationMeta = {
      totalItems,
      itemCount,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return { items, meta };
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

    // Si une nouvelle image est fournie, on supprime l'ancienne
    if (updateProductInput.image && product.image && product.image !== updateProductInput.image) {
      this.deleteImageFile(product.image);
    }

    Object.assign(product, updateProductInput);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<boolean> {
    const product = await this.findOne(id);

    // Supprime le fichier image s'il existe
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
