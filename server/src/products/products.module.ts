import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';
import { ReviewsModule } from '../reviews/reviews.module';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Review]), ReviewsModule],
  providers: [ProductsService, ProductsResolver],
})
export class ProductsModule {}
