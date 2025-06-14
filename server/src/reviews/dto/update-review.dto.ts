import { PartialType } from '@nestjs/mapped-types';
import { Field, InputType, Int } from '@nestjs/graphql';
import { CreateReviewDto } from './create-review.dto';

@InputType()
export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Int, { nullable: true })
  productId?: number;
}
