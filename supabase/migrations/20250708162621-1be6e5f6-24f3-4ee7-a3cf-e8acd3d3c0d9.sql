-- Fix RLS policy for payment_gateways table
DROP POLICY IF EXISTS "Admin can manage payment gateways" ON public.payment_gateways;

CREATE POLICY "Admin can manage payment gateways"
  ON public.payment_gateways
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (auth.uid())::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (auth.uid())::text
      AND role = 'admin'
    )
  );