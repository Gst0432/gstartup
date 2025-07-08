-- Créer une table pour les images publicitaires
CREATE TABLE public.advertisement_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisement_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active advertisement images"
  ON public.advertisement_images
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage advertisement images"
  ON public.advertisement_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_advertisement_images_updated_at
  BEFORE UPDATE ON public.advertisement_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default advertisement images
INSERT INTO public.advertisement_images (title, description, image_url, link_url, sort_order) VALUES
  ('Promo Électronique', 'Découvrez nos derniers produits électroniques', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', '#electronics', 1),
  ('Mode & Style', 'Nouvelle collection disponible maintenant', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', '#fashion', 2),
  ('Maison & Jardin', 'Aménagez votre intérieur avec style', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', '#home', 3);