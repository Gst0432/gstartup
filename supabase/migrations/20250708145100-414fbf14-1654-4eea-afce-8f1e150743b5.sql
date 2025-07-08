-- Create payment_gateways table
CREATE TABLE public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('moneroo', 'stripe', 'paypal', 'orange_money', 'mtn_money')),
  is_active boolean NOT NULL DEFAULT false,
  api_key text,
  api_secret text,
  webhook_secret text,
  test_mode boolean NOT NULL DEFAULT true,
  supported_currencies text[] NOT NULL DEFAULT '{}',
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(type)
);

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage payment gateways"
  ON public.payment_gateways
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
CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment gateways
INSERT INTO public.payment_gateways (name, type, supported_currencies, config) VALUES
  ('Moneroo', 'moneroo', ARRAY['XAF', 'CFA'], '{}'),
  ('Stripe', 'stripe', ARRAY['USD', 'EUR', 'XAF'], '{}'),
  ('Orange Money', 'orange_money', ARRAY['XAF'], '{}'),
  ('MTN Mobile Money', 'mtn_money', ARRAY['XAF'], '{}');