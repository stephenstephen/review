import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field(() => Float)
  @Column('float')
  price: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  @OneToMany(() => Review, (review) => review.product)
  reviews?: Review[];

  @Field(() => Number, { nullable: true })
  averageRating?: number;

  @Field(() => Number, { nullable: true })
  reviewsCount?: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
