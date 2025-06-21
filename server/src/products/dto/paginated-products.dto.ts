// src/products/dto/paginated-products.dto.ts
import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Product } from '../entities/product.entity';
import { Field } from '@nestjs/graphql';

@ObjectType()
export class PaginatedProducts extends PaginatedResponse {
  @Field(() => [Product])
  items: Product[];
}