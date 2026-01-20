-- Ensure new column exists
alter table public.assets
add column if not exists condition text;

-- Migrate existing data
update public.assets
set condition = status
where condition is null
  and status is not null;

-- Drop old column safely
alter table public.assets
drop column if exists status;
