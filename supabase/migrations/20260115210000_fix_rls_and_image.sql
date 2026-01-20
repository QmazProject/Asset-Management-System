-- Add image_url column to assets
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable RLS on tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for assets table
CREATE POLICY "Enable read access for authenticated users" ON public.assets
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.assets
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.assets
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.assets
    FOR DELETE
    TO authenticated
    USING (true);

-- Create policies for asset_services table
CREATE POLICY "Enable read access for authenticated users" ON public.asset_services
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.asset_services
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policies for asset_attachments table
CREATE POLICY "Enable read access for authenticated users" ON public.asset_attachments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.asset_attachments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
