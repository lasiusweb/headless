export class Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  mrp: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}
