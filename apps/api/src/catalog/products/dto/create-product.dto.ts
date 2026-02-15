export class CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  mrp: number;
  sku: string;
}
