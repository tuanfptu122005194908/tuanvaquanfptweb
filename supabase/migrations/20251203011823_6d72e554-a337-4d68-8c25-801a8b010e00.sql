-- Create storage buckets for product images and site assets
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('site-assets', 'site-assets', true);

-- RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS policies for site-assets bucket
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' 
  AND public.has_role(auth.uid(), 'admin')
);