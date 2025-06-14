import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewDto {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ description: 'Note sur 5' })
  rating: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Commentaire' })
  comment?: string;

  @Field(() => Int)
  @IsInt()
  @ApiProperty({ description: 'Id du produit' })
  productId: number;
}
