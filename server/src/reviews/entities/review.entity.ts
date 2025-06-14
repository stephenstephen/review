import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Min, Max, Length } from 'class-validator';
import { CreateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('reviews')
export class Review {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  productId: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @Column({ type: 'text' })
  @Length(3, 500)
  comment: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
