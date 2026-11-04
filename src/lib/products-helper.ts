import { Product, ProductColor } from '@/types';
import { DbProduct } from '@/app/actions/products';
import { PRODUCTS } from '@/data/products';

export function normalizeCategory(cat: string): 'scrubs' | 'blouses' | 'vestes' | 'packs' {
  const c = (cat || '').toLowerCase().trim();
  if (c.startsWith('scrub')) return 'scrubs';
  if (c.startsWith('blouse')) return 'blouses';
  if (c.startsWith('veste') || c.startsWith('polaire')) return 'vestes';
  if (c.startsWith('pack')) return 'packs';
  return 'scrubs';
}

/**
 * Convertit un DbProduct (Supabase) en Product (Frontend),
 * en fusionnant avec les templates riches locaux (images, tissus, coupes)
 * et en appliquant les données dynamiques de la base (prix, stock, visibilité).
 */
export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  const template = PRODUCTS.find(
    (p) => p.id === dbProduct.slug || p.id === dbProduct.id || p.name.toLowerCase() === dbProduct.title.toLowerCase()
  );

  if (template) {
    const colors: ProductColor[] =
      dbProduct.color_variants && dbProduct.color_variants.length > 0
        ? dbProduct.color_variants.map((cv, idx) => ({
            name: cv.name,
            hex: cv.hex,
            image:
              template.colors.find((c) => c.name.toLowerCase() === cv.name.toLowerCase())?.image ||
              template.colors[idx]?.image ||
              template.colors[0]?.image ||
              '/images/scrub-navy.jpg',
          }))
        : template.colors;

    const isOutOfStock =
      dbProduct.is_out_of_stock ?? (dbProduct.stock_quantity !== undefined && dbProduct.stock_quantity <= 0);

    return {
      ...template,
      id: dbProduct.slug || template.id,
      name: dbProduct.title || template.name,
      category: dbProduct.category ? normalizeCategory(dbProduct.category) : template.category,
      price: Number(dbProduct.price) || template.price,
      originalPrice: dbProduct.promo_price ? Number(dbProduct.promo_price) : template.originalPrice,
      description: dbProduct.description || template.description,
      long_description: dbProduct.long_description || template.description,
      sizes: dbProduct.sizes && dbProduct.sizes.length > 0 ? dbProduct.sizes : template.sizes,
      colors,
      stock_quantity: dbProduct.stock_quantity ?? 20,
      is_out_of_stock: isOutOfStock,
      is_active: dbProduct.is_active !== false,
      images: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images : template.colors.map((c) => c.image),
    };
  }

  // Produit créé manuellement sans template local
  const colors: ProductColor[] =
    dbProduct.color_variants && dbProduct.color_variants.length > 0
      ? dbProduct.color_variants.map((cv) => ({
          name: cv.name,
          hex: cv.hex,
          image: dbProduct.images?.[0] || '/images/scrub-navy.jpg',
        }))
      : dbProduct.colors && dbProduct.colors.length > 0
      ? dbProduct.colors.map((c) => ({
          name: c,
          hex: '#1B2A4A',
          image: dbProduct.images?.[0] || '/images/scrub-navy.jpg',
        }))
      : [{ name: 'Bleu Marine Médical', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' }];

  const isOutOfStock =
    dbProduct.is_out_of_stock ?? (dbProduct.stock_quantity !== undefined && dbProduct.stock_quantity <= 0);

  return {
    id: dbProduct.slug || dbProduct.id,
    name: dbProduct.title,
    subtitle: dbProduct.description ? dbProduct.description.slice(0, 80) : 'Tenue médicale professionnelle Blouseti',
    category: normalizeCategory(dbProduct.category || 'scrubs'),
    price: Number(dbProduct.price) || 299,
    originalPrice: dbProduct.promo_price ? Number(dbProduct.promo_price) : undefined,
    badge: 'Nouveau',
    rating: 4.9,
    reviewCount: 24,
    colors,
    sizes: dbProduct.sizes && dbProduct.sizes.length > 0 ? dbProduct.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: dbProduct.description || '',
    long_description: dbProduct.long_description,
    features: [
      'Tissu technique résistant et confortable',
      'Adapté au lavage régulier en milieu médical',
      'Option broderie personnalisée disponible',
    ],
    fabric: 'Microfibre technique 4-Way Stretch respirante',
    fit: 'Coupe confort ergonomique',
    stock_quantity: dbProduct.stock_quantity ?? 20,
    is_out_of_stock: isOutOfStock,
    is_active: dbProduct.is_active !== false,
  };
}

/**
 * Filtre les produits pour ne garder que ceux qui sont actifs/visibles dans la boutique.
 */
export function filterActiveProducts(products: Product[]): Product[] {
  return products.filter((p) => p.is_active !== false);
}
