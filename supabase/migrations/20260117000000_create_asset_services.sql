-- Create asset_services table
CREATE TABLE IF NOT EXISTS public.asset_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Historic', 'Upcoming')),
    status TEXT NOT NULL DEFAULT 'Pending',
    scheduled_date DATE,
    completion_date DATE,
    provider TEXT,
    cost NUMERIC,
    currency TEXT DEFAULT 'Philippine Peso',
    notes TEXT,
    service_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.asset_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.asset_services
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.asset_services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.asset_services
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.asset_services
    FOR DELETE USING (true);
