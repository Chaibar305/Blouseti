export type ProductCategory = string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ColorSizeVariant {
  size: string;
  stock: number;
  active: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  image_url?: string;
  sizes?: ColorSizeVariant[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  sizes: string[];
  description: string;
  features: string[];
  fabric: string;
  fit: string;
  is_active?: boolean;
  stock_quantity?: number;
  is_out_of_stock?: boolean;
  promo_price?: number | null;
  long_description?: string;
  images?: string[];
  embroidery_price?: number;
}

export interface EmbroideryOption {
  enabled: boolean;
  fullName: string;
  speciality: string;
  font: 'Moderne Classique' | 'Script Élégance' | 'Serif Prestige';
  color: 'Blanc Pur' | 'Argenté Reflet' | 'Bleu Ciel' | 'Doré';
  price: number;
}

export interface CartItem {
  id: string; // unique item instance id
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
  embroidery?: EmbroideryOption;
}

export interface CustomerInfo {
  gender?: 'Femme' | 'Homme' | string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface OrderData {
  orderId: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  embroideryTotal: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'COD';
}

export interface DbCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
