import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { FilterReviewDto, SortField } from './dto/filter-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const review = this.reviewRepository.create({ ...dto, product });
    return this.reviewRepository.save(review);
  }

  async findAll(filterDto: FilterReviewDto = {}): Promise<{ reviews: Review[], total: number }> {
    const { 
      productId, 
      page = 1, 
      limit = 10, 
      searchText, 
      sortBy = SortField.CREATED_AT, 
      sortOrder = 'DESC' 
    } = filterDto;

    const skip = (page - 1) * limit;
    
    // Construction de la requête
    const queryBuilder = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product');
    
    // Filtrage par produit
    if (productId) {
      queryBuilder.andWhere('review.productId = :productId', { productId });
    }
    
    // Recherche textuelle
    if (searchText) {
      queryBuilder.andWhere('review.comment ILIKE :searchText', { searchText: `%${searchText}%` });
    }
    
    // Tri
    queryBuilder.orderBy(`review.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    
    // Pagination
    queryBuilder.skip(skip).take(limit);
    
    // Exécution de la requête
    const [reviews, total] = await queryBuilder.getManyAndCount();
    
    return { reviews, total };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id }, relations: ['product'] });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, dto);
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const result = await this.reviewRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Review not found');
  }

  async findByProductId(productId: number, filterDto: FilterReviewDto = {}): Promise<Review[]> {
    const { 
      page = 1, 
      limit = 10, 
      searchText, 
      sortBy = SortField.CREATED_AT, 
      sortOrder = 'DESC' 
    } = filterDto;

    const skip = (page - 1) * limit;
    
    // Construction de la requête
    const queryBuilder = this.reviewRepository.createQueryBuilder('review')
      .where('review.productId = :productId', { productId });
    
    // Recherche textuelle
    if (searchText) {
      queryBuilder.andWhere('review.comment ILIKE :searchText', { searchText: `%${searchText}%` });
    }
    
    // Tri
    queryBuilder.orderBy(`review.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    
    // Pagination
    queryBuilder.skip(skip).take(limit);
    
    return queryBuilder.getMany();
  }
}
