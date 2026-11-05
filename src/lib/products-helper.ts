import { Product, ProductColor } from '@/types';
import { DbProduct } from '@/app/actions/products';
import { PRODUCTS } from '@/data/products';

export function normalizeCategory(cat: string): string {
  const c = (cat || '').toLowerCase().trim();
  if (c === 'scrubs' || c === 'scrub') return 'scrub';
  if (c === 'blouses' || c === 'blouse') return 'blouse';
  if (c === 'vestes' || c === 'veste' || c === 'polaire' || c === 'polaires') return 'polaire';
  if (c === 'packs' || c === 'pack') return 'pack';
  if (c.startsWith('cuisin') || c.includes('chef')) return 'cuisine';
  if (c.startsWith('hotel') || c.includes('servic')) return 'hotellerie';
  return c || 'scrub';
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
        ? dbProduct.color_variants.map((cv: any, idx) => {
            const img =
              cv.image_url ||
              cv.image ||
              template.colors.find((c) => c.name.toLowerCase() === cv.name.toLowerCase())?.image ||
              template.colors[idx]?.image ||
              template.colors[0]?.image ||
              '/images/scrub-navy.jpg';
            return {
              name: cv.name,
              hex: cv.hex,
              image: img,
              image_url: img,
              sizes: cv.sizes,
            };
          })
        : template.colors.map((c) => ({ ...c, image_url: c.image }));

    const isOutOfStock =
      dbProduct.is_out_of_stock ?? (dbProduct.stock_quantity !== undefined && dbProduct.stock_quantity <= 0);

    // Rassembler toutes les images avec en 1ère position l'image de la couleur par défaut
    const orderedImages: string[] = [];
    const defaultImg = colors[0]?.image_url || colors[0]?.image;
    if (defaultImg) orderedImages.push(defaultImg);
    colors.forEach((c) => {
      const img = c.image_url || c.image;
      if (img && !orderedImages.includes(img)) orderedImages.push(img);
    });
    if (dbProduct.images && dbProduct.images.length > 0) {
      dbProduct.images.forEach((img) => {
        if (img && !orderedImages.includes(img)) orderedImages.push(img);
      });
    }

    const embPrice =
      dbProduct.embroidery_price !== undefined && dbProduct.embroidery_price !== null
        ? Number(dbProduct.embroidery_price)
        : template.embroidery_price !== undefined
        ? template.embroidery_price
        : template.category === 'packs'
        ? 0
        : 45;

    return {
      ...template,
      id: dbProduct.slug || template.id,
      slug: dbProduct.slug || template.slug || template.id,
      name: dbProduct.title || template.name,
      category: dbProduct.category ? normalizeCategory(dbProduct.category) : template.category,
      price: dbProduct.price !== undefined && dbProduct.price !== null ? Number(dbProduct.price) : template.price,
      originalPrice:
        dbProduct.promo_price !== undefined && dbProduct.promo_price !== null
          ? Number(dbProduct.promo_price)
          : template.originalPrice,
      embroidery_price: embPrice,
      description: dbProduct.description || template.description,
      long_description: dbProduct.long_description || template.description,
      sizes: dbProduct.sizes && dbProduct.sizes.length > 0 ? dbProduct.sizes : template.sizes,
      colors,
      stock_quantity: dbProduct.stock_quantity ?? 20,
      is_out_of_stock: isOutOfStock,
      is_active: dbProduct.is_active !== false,
      images: orderedImages.length > 0 ? orderedImages : template.colors.map((c) => c.image),
    };
  }

  // Produit créé manuellement sans template local
  const colors: ProductColor[] =
    dbProduct.color_variants && dbProduct.color_variants.length > 0
      ? dbProduct.color_variants.map((cv: any) => {
          const img = cv.image_url || cv.image || dbProduct.images?.[0] || '/images/scrub-navy.jpg';
          return {
            name: cv.name,
            hex: cv.hex,
            image: img,
            image_url: img,
            sizes: cv.sizes,
          };
        })
      : dbProduct.colors && dbProduct.colors.length > 0
      ? dbProduct.colors.map((c) => ({
          name: c,
          hex: '#1B2A4A',
          image: dbProduct.images?.[0] || '/images/scrub-navy.jpg',
          image_url: dbProduct.images?.[0] || '/images/scrub-navy.jpg',
        }))
      : [{ name: 'Bleu Marine Médical', hex: '#1B2A4A', image: '/images/scrub-navy.jpg', image_url: '/images/scrub-navy.jpg' }];

  const isOutOfStock =
    dbProduct.is_out_of_stock ?? (dbProduct.stock_quantity !== undefined && dbProduct.stock_quantity <= 0);

  const customEmbPrice =
    dbProduct.embroidery_price !== undefined && dbProduct.embroidery_price !== null
      ? Number(dbProduct.embroidery_price)
      : 45;

  return {
    id: dbProduct.slug || dbProduct.id,
    slug: dbProduct.slug || dbProduct.id,
    name: dbProduct.title,
    subtitle: dbProduct.description ? dbProduct.description.slice(0, 80) : 'Tenue médicale professionnelle Blouseti',
    category: normalizeCategory(dbProduct.category || 'scrubs'),
    price: Number(dbProduct.price) || 299,
    originalPrice: dbProduct.promo_price ? Number(dbProduct.promo_price) : undefined,
    embroidery_price: customEmbPrice,
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
    images: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images : colors.map((c) => c.image_url || c.image),
  };
}

/**
 * Filtre les produits pour ne garder que ceux qui sont actifs/visibles dans la boutique.
 */
export function filterActiveProducts(products: Product[]): Product[] {
  return products.filter((p) => p.is_active !== false);
}
