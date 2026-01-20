create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  status text,
  created_at timestamptz default now()
);
