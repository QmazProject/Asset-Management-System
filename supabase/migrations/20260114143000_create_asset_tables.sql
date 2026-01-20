-- Create Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_code_type TEXT,
    scan_code TEXT,
    inventory_number TEXT,
    serial_number TEXT,
    cs_number TEXT,
    plate_number TEXT,
    engine_number TEXT,
    track_via_geotag BOOLEAN DEFAULT FALSE,
    manufacturer TEXT,
    model TEXT,
    asset_name TEXT,
    status TEXT,
    asset_group TEXT,
    description TEXT,
    label TEXT,
    default_location_type TEXT,
    default_location TEXT,
    storage_location TEXT,
    current_location_type TEXT,
    current_location TEXT,
    responsible_employee TEXT,
    owner TEXT,
    ownership_type TEXT,
    vendor TEXT,
    purchase_date TEXT,
    cost_code TEXT,
    purchase_order_number TEXT,
    purchase_price TEXT,
    purchase_currency TEXT,
    warranty_expiration_date TEXT,
    replacement_cost TEXT,
    notes TEXT
);

-- Create Asset Services Table
CREATE TABLE IF NOT EXISTS asset_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    category TEXT,
    next_service_date TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Asset Attachments Table
CREATE TABLE IF NOT EXISTS asset_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- The storage bucket creation is usually strictly not part of SQL migrations in Supabase unless you use the pg_net extension or direct inserts into storage.buckets which might require permissions.
-- However, for completeness in a migration managed by CLI if you have permissions:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('asset-attachments', 'asset-attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for public access (optional, adjust based on your security needs)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'asset-attachments');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'asset-attachments');
