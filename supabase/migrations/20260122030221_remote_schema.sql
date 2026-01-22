drop extension if exists "pg_net";

drop policy "Allow authenticated delete to service_template_attachments" on "public"."service_template_attachments";

drop policy "Allow authenticated insert to service_template_attachments" on "public"."service_template_attachments";

drop policy "Allow public read access to service_template_attachments" on "public"."service_template_attachments";

drop policy "Allow authenticated delete to service_templates" on "public"."service_templates";

drop policy "Allow authenticated insert to service_templates" on "public"."service_templates";

drop policy "Allow authenticated update to service_templates" on "public"."service_templates";

drop policy "Allow public read access to service_templates" on "public"."service_templates";

revoke delete on table "public"."service_template_attachments" from "anon";

revoke insert on table "public"."service_template_attachments" from "anon";

revoke references on table "public"."service_template_attachments" from "anon";

revoke select on table "public"."service_template_attachments" from "anon";

revoke trigger on table "public"."service_template_attachments" from "anon";

revoke truncate on table "public"."service_template_attachments" from "anon";

revoke update on table "public"."service_template_attachments" from "anon";

revoke delete on table "public"."service_template_attachments" from "authenticated";

revoke insert on table "public"."service_template_attachments" from "authenticated";

revoke references on table "public"."service_template_attachments" from "authenticated";

revoke select on table "public"."service_template_attachments" from "authenticated";

revoke trigger on table "public"."service_template_attachments" from "authenticated";

revoke truncate on table "public"."service_template_attachments" from "authenticated";

revoke update on table "public"."service_template_attachments" from "authenticated";

revoke delete on table "public"."service_template_attachments" from "service_role";

revoke insert on table "public"."service_template_attachments" from "service_role";

revoke references on table "public"."service_template_attachments" from "service_role";

revoke select on table "public"."service_template_attachments" from "service_role";

revoke trigger on table "public"."service_template_attachments" from "service_role";

revoke truncate on table "public"."service_template_attachments" from "service_role";

revoke update on table "public"."service_template_attachments" from "service_role";

revoke delete on table "public"."service_templates" from "anon";

revoke insert on table "public"."service_templates" from "anon";

revoke references on table "public"."service_templates" from "anon";

revoke select on table "public"."service_templates" from "anon";

revoke trigger on table "public"."service_templates" from "anon";

revoke truncate on table "public"."service_templates" from "anon";

revoke update on table "public"."service_templates" from "anon";

revoke delete on table "public"."service_templates" from "authenticated";

revoke insert on table "public"."service_templates" from "authenticated";

revoke references on table "public"."service_templates" from "authenticated";

revoke select on table "public"."service_templates" from "authenticated";

revoke trigger on table "public"."service_templates" from "authenticated";

revoke truncate on table "public"."service_templates" from "authenticated";

revoke update on table "public"."service_templates" from "authenticated";

revoke delete on table "public"."service_templates" from "service_role";

revoke insert on table "public"."service_templates" from "service_role";

revoke references on table "public"."service_templates" from "service_role";

revoke select on table "public"."service_templates" from "service_role";

revoke trigger on table "public"."service_templates" from "service_role";

revoke truncate on table "public"."service_templates" from "service_role";

revoke update on table "public"."service_templates" from "service_role";

alter table "public"."service_template_attachments" drop constraint "service_template_attachments_template_id_fkey";

alter table "public"."service_template_attachments" drop constraint "service_template_attachments_pkey";

alter table "public"."service_templates" drop constraint "service_templates_pkey";

drop index if exists "public"."service_template_attachments_pkey";

drop index if exists "public"."service_templates_pkey";

drop table "public"."service_template_attachments";

drop table "public"."service_templates";

alter table "public"."asset_attachments" add column "uploaded_by" uuid;

alter table "public"."asset_attachments" alter column "asset_id" set not null;

alter table "public"."assets" drop column "default_location";

alter table "public"."assets" drop column "scan_code_type";

alter table "public"."assets" drop column "storage_location";

alter table "public"."assets" drop column "track_via_geotag";

alter table "public"."assets" alter column "asset_name" set not null;

alter table "public"."asset_attachments" add constraint "asset_attachments_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."asset_attachments" validate constraint "asset_attachments_uploaded_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$  -- TRIGGER = Special function that runs automatically
BEGIN
  -- Set the "updated_at" field of the NEW row to the current timestamp
  NEW.updated_at = NOW();
  RETURN NEW;  -- Return the modified row
END;
$function$
;

drop policy "Allow authenticated deletions from service-attachments" on "storage"."objects";

drop policy "Allow authenticated uploads to service-attachments" on "storage"."objects";

drop policy "Give public access to service-attachments" on "storage"."objects";

drop policy "Public Access" on "storage"."objects";

drop policy "Public Upload" on "storage"."objects";


  create policy "Allow authenticated deletes 18j9gsz_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "Allow authenticated deletes 18j9gsz_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "Allow authenticated updates 18j9gsz_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "Allow authenticated updates 18j9gsz_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "Public read access 18j9gsz_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "asset-attachments 18j9gsz_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "asset-attachments 18j9gsz_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'asset-attachments'::text));



  create policy "asset-attachments 18j9gsz_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



  create policy "asset-attachments 18j9gsz_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'asset-attachments'::text));



