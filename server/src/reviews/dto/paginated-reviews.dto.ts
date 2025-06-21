import { Field, ObjectType } from '@nestjs/graphql';
import { Review } from '../entities/review.entity';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';

@ObjectType()
export class PaginatedReviews extends PaginatedResponse {
  @Field(() => [Review])
  items: Review[];
}
