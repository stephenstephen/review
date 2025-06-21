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
  
    // Première requête pour obtenir les IDs des produits avec pagination
    const query = this.productRepository
      .createQueryBuilder('product')
      .select('product.id');
  
    if (search) {
      query.where('product.name ILIKE :search', { search: `%${search}%` });
    }
  
    // Appliquer la pagination
    query.skip(skip).take(limit);
  
    // Exécuter la requête pour obtenir les IDs
    const [productIds, totalItems] = await Promise.all([
      query.getMany().then(products => products.map(p => p.id)),
      query.getCount()
    ]);
  
    // Si aucun produit ne correspond à la recherche
    if (productIds.length === 0) {
      return {
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        }
      };
    }
  
    // Deuxième requête pour obtenir les produits complets avec les relations
    const [items] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'review')
      .where('product.id IN (:...ids)', { ids: productIds })
      .getManyAndCount();
  
    // Calculer les moyennes manuellement
    const itemsWithStats = items.map(product => {
      if (product.reviews && product.reviews.length > 0) {
        const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        product.averageRating = sum / product.reviews.length;
        product.reviewsCount = product.reviews.length;
      } else {
        product.averageRating = 0;
        product.reviewsCount = 0;
      }
      return product;
    });
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return {
      items: itemsWithStats,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      }
    };
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
