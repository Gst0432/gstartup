-- Create delivery logs table to track automatic deliveries
CREATE TABLE public.delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  delivery_type TEXT NOT NULL DEFAULT 'digital',
  products_delivered JSONB NOT NULL DEFAULT '[]'::jsonb,
  email_sent_to TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all delivery logs" 
ON public.delivery_logs 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = (auth.uid())::text) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Vendors can view their delivery logs" 
ON public.delivery_logs 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM order_items oi
   JOIN vendors v ON v.id = oi.vendor_id
   JOIN profiles p ON p.user_id = v.user_id
  WHERE oi.order_id = delivery_logs.order_id AND p.user_id = (auth.uid())::text));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_delivery_logs_updated_at
BEFORE UPDATE ON public.delivery_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();