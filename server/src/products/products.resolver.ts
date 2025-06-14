import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql/gql-auth.guard';
import { ReviewsService } from '../reviews/reviews.service';
import { Review } from '../reviews/entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  createProduct(@Args('createProductInput') createProductInput: CreateProductInput) {
    return this.productsService.create(createProductInput);
  }

  @Query(() => [Product], { name: 'products' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.productsService.findAll();
  }

  @Query(() => Product, { name: 'product' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productsService.remove(id);
  }

  @ResolveField(() => [Review], { name: 'reviews' })
  async getReviews(@Parent() product: Product): Promise<Review[]> {
    return this.reviewsService.findByProductId(product.id);
  }

  @ResolveField(() => Number, { name: 'averageRating', nullable: true })
  async getAverageRating(@Parent() product: Product): Promise<number | null> {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: product.id } },
      select: ['rating'],
    });

    if (!reviews.length) return null;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(2));
  }

  @ResolveField(() => Number, { name: 'reviewsCount', nullable: true })
  async getReviewsCount(@Parent() product: Product): Promise<number> {
    return this.reviewRepository.count({
      where: { product: { id: product.id } },
    });
  }
}
