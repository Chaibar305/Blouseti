-- ==============================================================================
-- BLOOUSETI (بلوزتي) - SCHEMA SUPABASE E-COMMERCE & CASH ON DELIVERY (COD)
-- Synchronisé & À Jour avec toutes les fonctionnalités (Produits, Commandes, Paramètres, Catégories, Coupons)
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
  category text not null, -- 'scrub', 'blouse', 'polaire', 'pack', 'cuisine', 'hotellerie'
  stock_quantity integer default 20,
  is_out_of_stock boolean default false,
  colors text[] default '{}',
  sizes text[] default '{}',
  images text[] default '{}',
  color_variants jsonb default '[]'::jsonb,
  size_variants jsonb default '[]'::jsonb,
  embroidery_price numeric default 45,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Mise à niveau des colonnes si la table existe déjà
alter table public.products 
add column if not exists stock_quantity integer default 20,
add column if not exists is_out_of_stock boolean default false,
add column if not exists promo_price numeric default null,
add column if not exists long_description text,
add column if not exists color_variants jsonb default '[]'::jsonb,
add column if not exists size_variants jsonb default '[]'::jsonb,
add column if not exists embroidery_price numeric default 45,
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Table des Commandes (Cash On Delivery)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique,
  customer_name text not null,
  gender text default 'Femme',
  phone text not null,
  city text not null,
  address text not null,
  items jsonb not null, -- [{id, name, color, size, quantity, price, embroidery}]
  custom_embroidery text,
  coupon_code text,
  discount_amount numeric default 0,
  total_amount numeric not null,
  status text default 'nouveau', -- 'nouveau', 'confirmé', 'expédié', 'livré', 'annulé'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Mise à niveau des colonnes si la table existe déjà
alter table public.orders
add column if not exists gender text default 'Femme',
add column if not exists coupon_code text,
add column if not exists discount_amount numeric default 0;

-- 3. Table des Paramètres du Site (Site Settings)
create table if not exists public.site_settings (
  id text primary key default 'general',
  whatsapp_number text default '212603660658',
  phone text default '+212 6 03 66 06 58',
  email text default 'contact@blouseti.shop',
  address text default 'Casablanca, Maroc',
  topbar_text text default 'Livraison Partout au Maroc en 24-48h • Paiement Cash à la Livraison • Échange de taille garanti',
  instagram_url text default 'https://www.instagram.com/blouseti.shop/',
  facebook_url text default 'https://web.facebook.com/profile.php?id=61596347515075',
  shipping_fee numeric default 29,
  free_shipping_threshold numeric default 400,
  fb_pixel_id text,
  tiktok_pixel_id text,
  snapchat_pixel_id text,
  google_analytics_id text,
  cod_conversion_event text default 'Purchase',
  custom_header_code text,
  custom_footer_code text,
  google_sheets_enabled boolean default false,
  google_sheets_id text,
  google_sheets_service_account text,
  google_sheets_range text default 'Commandes!A:H',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Table des Catégories
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  icon text default 'Sparkles',
  description text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Table des Coupons / Codes Promo
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_type text not null default 'percentage', -- 'percentage' ou 'fixed'
  discount_value numeric not null,
  min_order_amount numeric default 0,
  max_uses integer default 100,
  used_count integer default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Table des Événements Analytiques
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index pour recherche rapide et performances
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_categories_slug on public.categories(slug);

-- ==============================================================================
-- 7. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.coupons enable row level security;
alter table public.analytics_events enable row level security;

-- Produits : Lecture publique pour les articles actifs
drop policy if exists "Allow public read access to active products" on public.products;
create policy "Allow public read access to active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Produits : Gestion complète pour les administrateurs
drop policy if exists "Allow admin full access to products" on public.products;
create policy "Allow admin full access to products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- Commandes : Insertion publique permise pour le passage de commande COD
drop policy if exists "Allow public insert for COD orders" on public.orders;
create policy "Allow public insert for COD orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Commandes : Accès administrateur complet
drop policy if exists "Allow admin full access to orders" on public.orders;
create policy "Allow admin full access to orders"
  on public.orders for all
  to authenticated
  using (true)
  with check (true);

-- Paramètres : Lecture publique pour le site
drop policy if exists "Allow public read site settings" on public.site_settings;
create policy "Allow public read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Paramètres : Modification réservée aux admins
drop policy if exists "Allow admin full access to site settings" on public.site_settings;
create policy "Allow admin full access to site settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

-- Catégories : Lecture publique
drop policy if exists "Allow public read categories" on public.categories;
create policy "Allow public read categories"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

-- Catégories : Gestion admin
drop policy if exists "Allow admin full access to categories" on public.categories;
create policy "Allow admin full access to categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

-- Coupons : Lecture publique pour validation panier
drop policy if exists "Allow public read coupons" on public.coupons;
create policy "Allow public read coupons"
  on public.coupons for select
  to anon, authenticated
  using (is_active = true);

-- Coupons : Gestion admin
drop policy if exists "Allow admin full access to coupons" on public.coupons;
create policy "Allow admin full access to coupons"
  on public.coupons for all
  to authenticated
  using (true)
  with check (true);

-- Analytics : Insertion publique
drop policy if exists "Allow public insert analytics" on public.analytics_events;
create policy "Allow public insert analytics"
  on public.analytics_events for insert
  to anon, authenticated
  with check (true);
