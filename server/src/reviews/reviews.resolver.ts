import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql/gql-auth.guard';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  createReview(@Args('createReviewInput') createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Query(() => [Review], { name: 'reviews' })
  @UseGuards(GqlAuthGuard)
  findAll(@Args('productId', { type: () => Int, nullable: true }) productId?: number) {
    return this.reviewsService.findAll(productId);
  }

  @Query(() => Review, { name: 'review' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  updateReview(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateReviewInput') updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeReview(@Args('id', { type: () => Int }) id: number) {
    return this.reviewsService.remove(id);
  }
}
