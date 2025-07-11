export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  is_digital?: boolean;
  digital_file_url?: string;
  quantity: number;
  category_id: string;
  tags?: string[];
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}