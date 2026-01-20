-- Add missing columns to assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS scan_code_type TEXT,
ADD COLUMN IF NOT EXISTS scan_code TEXT,
ADD COLUMN IF NOT EXISTS inventory_number TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS cs_number TEXT,
ADD COLUMN IF NOT EXISTS plate_number TEXT,
ADD COLUMN IF NOT EXISTS engine_number TEXT,
ADD COLUMN IF NOT EXISTS track_via_geotag BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
-- asset_name already exists through previous migration
-- status already exists through previous migration
ADD COLUMN IF NOT EXISTS asset_group TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS label TEXT,
ADD COLUMN IF NOT EXISTS default_location_type TEXT,
ADD COLUMN IF NOT EXISTS default_location TEXT,
ADD COLUMN IF NOT EXISTS storage_location TEXT,
ADD COLUMN IF NOT EXISTS current_location_type TEXT,
ADD COLUMN IF NOT EXISTS current_location TEXT,
ADD COLUMN IF NOT EXISTS responsible_employee TEXT,
ADD COLUMN IF NOT EXISTS owner TEXT,
ADD COLUMN IF NOT EXISTS ownership_type TEXT,
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS purchase_date TEXT,
ADD COLUMN IF NOT EXISTS cost_code TEXT,
ADD COLUMN IF NOT EXISTS purchase_order_number TEXT,
ADD COLUMN IF NOT EXISTS purchase_price TEXT,
ADD COLUMN IF NOT EXISTS purchase_currency TEXT,
ADD COLUMN IF NOT EXISTS warranty_expiration_date TEXT,
ADD COLUMN IF NOT EXISTS replacement_cost TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create Asset Services Table (was missing)
CREATE TABLE IF NOT EXISTS public.asset_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    category TEXT,
    next_service_date TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
