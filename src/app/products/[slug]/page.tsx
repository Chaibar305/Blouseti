import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlugAction, getActiveProductsAction } from '@/app/actions/products';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailView from '@/components/ProductDetailView';
import { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProductBySlugAction(slug);
  const product: Product | undefined = res.product;

  if (!product) {
    return {
      title: 'Produit introuvable | Blouseti Maroc',
      description: 'Le produit demandé est introuvable sur la boutique officielle Blouseti.',
    };
  }

  const title = `${product.name} - Blouseti Maroc`;
  const description =
    product.subtitle ||
    product.description ||
    'Tenue médicale professionnelle haute performance confectionnée pour les soignants au Maroc. Paiement à la livraison.';

  const image =
    (product.images && product.images[0]) ||
    (product.colors && product.colors[0]?.image) ||
    '/logo.png';

  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `https://blouseti.shop${image}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://blouseti.shop/products/${product.slug || product.id}`,
      siteName: 'Blouseti Maroc',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} - Vêtement Médical Blouseti`,
        },
      ],
      type: 'website',
      locale: 'fr_MA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: `https://blouseti.shop/products/${product.slug || product.id}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const res = await getProductBySlugAction(slug);
  const product: Product | undefined = res.product;

  if (!product) {
    notFound();
  }

  // Récupérer les produits recommandés / associés
  const allActive = await getActiveProductsAction();
  const relatedProducts = allActive.filter(
    (p: Product) => (p.slug || p.id) !== (product.slug || product.id)
  );

  // Schema.org Structured Data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.subtitle || product.description,
    image: (product.images || [product.colors[0]?.image || '/logo.png']).map((img: string) =>
      img.startsWith('http') ? img : `https://blouseti.shop${img}`
    ),
    brand: {
      '@type': 'Brand',
      name: 'Blouseti',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.is_out_of_stock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Blouseti Maroc',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating || 4.9),
      reviewCount: String(product.reviewCount || 42),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <TopBar />
      <Header />
      <main className="flex-1">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
