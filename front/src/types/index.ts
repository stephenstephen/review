export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  averageRating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  productId: number;
  product?: {
    id: number;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export enum SortField {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface ReviewFilters extends PaginationParams {
  productId?: number;
  searchText?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}
