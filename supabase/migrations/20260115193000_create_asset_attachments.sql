create table if not exists public.asset_attachments (
  id uuid primary key default gen_random_uuid(),

  asset_id uuid not null
    references public.assets(id)
    on delete cascade,

  file_name text not null,
  file_path text not null,        -- storage path or URL
  file_type text,                 -- pdf, image, docx, etc
  file_size bigint,               -- bytes

  uploaded_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz default now()
);
