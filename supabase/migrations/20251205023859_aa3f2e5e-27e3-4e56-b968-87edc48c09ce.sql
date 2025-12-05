-- Fix RLS policies for products - make them PERMISSIVE instead of RESTRICTIVE
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Create permissive policies (default is PERMISSIVE)
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (active = true);