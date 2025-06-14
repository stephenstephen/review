import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, Length, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @Field()
  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @Field(() => Float)
  @Min(0)
  price: number;

  @Field({ nullable: true })
  image?: string;
}
