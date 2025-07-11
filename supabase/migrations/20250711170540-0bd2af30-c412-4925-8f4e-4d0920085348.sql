-- Créer une table pour stocker les documents attachés aux commandes
CREATE TABLE public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'pdf',
  file_size INTEGER,
  created_by TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer les index pour améliorer les performances
CREATE INDEX idx_order_documents_order_id ON public.order_documents(order_id);
CREATE INDEX idx_order_documents_created_by ON public.order_documents(created_by);

-- Activer RLS
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour order_documents
-- Les clients peuvent voir les documents de leurs propres commandes
CREATE POLICY "Customers can view their order documents"
ON public.order_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN profiles p ON p.user_id = o.user_id
    WHERE o.id = order_documents.order_id
    AND p.user_id = (auth.uid())::text
  )
);

-- Les admins peuvent gérer tous les documents
CREATE POLICY "Admins can manage all order documents"
ON public.order_documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = (auth.uid())::text
    AND profiles.role = 'admin'
  )
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_order_documents_updated_at
  BEFORE UPDATE ON public.order_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();