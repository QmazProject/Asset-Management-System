


  create table "public"."user_profiles" (
    "id" uuid not null,
    "full_name" text not null,
    "username" text not null,
    "email" text not null,
    "branch" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_profiles" enable row level security;

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);

CREATE INDEX idx_user_profiles_username ON public.user_profiles USING btree (username);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_username_key ON public.user_profiles USING btree (username);

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_branch_check" CHECK ((branch = ANY (ARRAY['QM Builders'::text, 'Adamant Dev Corp.'::text, 'QG Dev Corp.'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_branch_check";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_username_key" UNIQUE using index "user_profiles_username_key";

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

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";


  create policy "Allow profile creation"
  on "public"."user_profiles"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can update own profile"
  on "public"."user_profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));


CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

drop policy if exists "Public Access" on "storage"."objects";

drop policy if exists "Public Upload" on "storage"."objects";


