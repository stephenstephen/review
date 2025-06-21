import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql/gql-auth.guard';
import { FilterReviewDto } from './dto/filter-review.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { PaginatedReviews } from './dto/paginated-reviews.dto';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  createReview(@Args('createReviewInput') createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Query(() => PaginatedReviews, { name: 'reviews' })
  @UseGuards(GqlAuthGuard)
  async findAll(@Args('filter', { nullable: true }) filterDto?: FilterReviewDto) {
    const { reviews, total } = await this.reviewsService.findAll(filterDto);
    
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 10;
    const totalPages = Math.ceil(total / limit);
    
    return {
      items: reviews,
      meta: {
        totalItems: total,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      }
    };
  }

  @Query(() => Review, { name: 'review' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateReview(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateReviewInput') updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeReview(@Args('id', { type: () => Int }) id: number) {
    return this.reviewsService.remove(id);
  }
}
