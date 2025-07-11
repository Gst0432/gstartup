export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  quantity: number;
  created_at: string;
  category: {
    name: string;
  };
}