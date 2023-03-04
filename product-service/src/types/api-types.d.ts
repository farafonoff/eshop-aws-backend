export interface Product {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
}

export type Products = Product[];

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
}
