-- Create service_templates table
create table if not exists public.service_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_critical boolean default false,
  service_type text not null, -- 'One time service' or 'Recurrent'
  based_on text not null, -- 'Period', 'Distance (Heavy equipment only)', 'Engine hours (Heavy equipment only)'
  unit_of_measurement text, -- 'Days', 'Weeks', 'Months', 'Years' (only for Period)
  frequency_number integer, -- for Recurrent
  notification_mode text default 'automatic', -- 'automatic', 'manual'
  notification_number integer,
  notification_unit text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Associate table with service_template_attachments
create table if not exists public.service_template_attachments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.service_templates(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.service_templates enable row level security;
alter table public.service_template_attachments enable row level security;

-- Policies for service_templates
create policy "Allow public read access to service_templates"
  on public.service_templates for select
  to public
  using (true);

create policy "Allow authenticated insert to service_templates"
  on public.service_templates for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update to service_templates"
  on public.service_templates for update
  to authenticated
  using (true);

create policy "Allow authenticated delete to service_templates"
  on public.service_templates for delete
  to authenticated
  using (true);

-- Policies for service_template_attachments
create policy "Allow public read access to service_template_attachments"
  on public.service_template_attachments for select
  to public
  using (true);

create policy "Allow authenticated insert to service_template_attachments"
  on public.service_template_attachments for insert
  to authenticated
  with check (true);

create policy "Allow authenticated delete to service_template_attachments"
  on public.service_template_attachments for delete
  to authenticated
  using (true);

-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('service-attachments', 'service-attachments', true)
on conflict (id) do nothing;

-- Storage policies for service-attachments bucket
create policy "Give public access to service-attachments"
  on storage.objects for select
  to public
  using (bucket_id = 'service-attachments');

create policy "Allow authenticated uploads to service-attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'service-attachments');

create policy "Allow authenticated deletions from service-attachments"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'service-attachments');
