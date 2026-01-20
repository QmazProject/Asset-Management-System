-- Add missing UPDATE and DELETE policies for asset_services table
CREATE POLICY "Enable update access for authenticated users" ON public.asset_services
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.asset_services
    FOR DELETE
    TO authenticated
    USING (true);

-- Add missing UPDATE and DELETE policies for asset_attachments table
CREATE POLICY "Enable update access for authenticated users" ON public.asset_attachments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.asset_attachments
    FOR DELETE
    TO authenticated
    USING (true);
