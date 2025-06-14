import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserGraphqlDto {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;
}
