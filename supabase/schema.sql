-- ==============================================================================
-- BLOOUSETI (بلوزتي) - SCHEMA SUPABASE E-COMMERCE & CASH ON DELIVERY (COD)
-- ==============================================================================

-- 1. Table des Produits
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  long_description text,
  price numeric not null,
  promo_price numeric default null,
  category text not null, -- 'scrub', 'blouse', 'polaire', 'pack'
  stock_quantity integer default 20,
  is_out_of_stock boolean default false,
  colors text[] default '{}',
  sizes text[] default '{}',
  images text[] default '{}',
  color_variants jsonb default '[]'::jsonb,
  size_variants jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Mise à niveau si la table existe déjà
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS is_out_of_stock boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS long_description text,
ADD COLUMN IF NOT EXISTS color_variants jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS size_variants jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Fonction de mise à jour automatique de la date
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Table des Commandes (Cash On Delivery)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  items jsonb not null, -- Liste des articles, tailles et couleurs [{product_id, title, size, color, quantity, price}]
  custom_embroidery text, -- Texte de broderie (ex: "Dr. Amine Bennani - Chirurgien Dentiste")
  total_amount numeric not null,
  status text default 'nouveau', -- 'nouveau', 'confirmé', 'expédié', 'livré', 'annulé'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index pour recherche rapide et tri
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_slug on public.products(slug);

-- ==============================================================================
-- 3. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Produits : Lecture publique pour les articles actifs
drop policy if exists "Allow public read access to active products" on public.products;
create policy "Allow public read access to active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Produits : Gestion complète pour les administrateurs connectés
drop policy if exists "Allow admin full access to products" on public.products;
create policy "Allow admin full access to products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- Commandes : Insertion publique permise pour le passage de commande COD (tunnel d'achat)
drop policy if exists "Allow public insert for COD orders" on public.orders;
create policy "Allow public insert for COD orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Commandes : Accès administrateur complet (lecture, mise à jour du statut, suppression)
drop policy if exists "Allow admin full access to orders" on public.orders;
create policy "Allow admin full access to orders"
  on public.orders for all
  to authenticated
  using (true)
  with check (true);

-- ==============================================================================
-- 4. DONNÉES INITIALES (SEED) POUR LE CATALOGUE BLOOUSETI
-- ==============================================================================

insert into public.products (title, slug, description, price, category, colors, sizes, images, is_active)
values
  (
    'Scrub Médical Confort 4-Way Stretch',
    'scrub-prestige-4way',
    'Ensemble complet haut col V et jogger 6 poches. Tissu respirant résistant aux lavages fréquents.',
    349,
    'scrub',
    array['Bleu Marine Médical', 'Vert Sauge Apaisant', 'Bordeaux Chirurgical'],
    array['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    array['/images/scrub-navy.jpg', '/images/scrub-sage.jpg', '/images/scrub-burgundy.jpg'],
    true
  ),
  (
    'Blouse Médicale Blanche "Dr. Prestige"',
    'blouse-dr-prestige',
    'Coupe cintrée haut de gamme avec col officier et boutons pression inoxydables.',
    289,
    'blouse',
    array['Blanc Pur Optique', 'Blanc & Liseré Marine'],
    array['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    array['/images/blouse-blanche.jpg'],
    true
  ),
  (
    'Veste Polaire Médicale Thermo-Lite',
    'veste-polaire-thermo',
    'Veste zippée micropolaire chaude pour blocs opératoires et gardes de nuit.',
    299,
    'polaire',
    array['Bleu Marine Clinique', 'Noir Carbone'],
    array['S', 'M', 'L', 'XL', 'XXL'],
    array['/images/veste-polaire.jpg'],
    true
  ),
  (
    'Pack Duo "Garde 24h" (2 Scrubs + Broderie Offerte)',
    'pack-garde-duo',
    '2 ensembles complets au choix avec broderie personnalisée 100% offerte.',
    599,
    'pack',
    array['Duo Bleu Marine & Vert Sauge', 'Duo Bleu Marine & Bordeaux'],
    array['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    array['/images/scrub-navy.jpg', '/images/scrub-sage.jpg'],
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  price = excluded.price,
  description = excluded.description;
