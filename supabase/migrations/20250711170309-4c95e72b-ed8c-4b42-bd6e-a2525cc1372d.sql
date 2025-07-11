-- Ajouter des colonnes pour tracker les dépenses et commandes des clients
ALTER TABLE public.profiles 
ADD COLUMN total_spent NUMERIC DEFAULT 0,
ADD COLUMN total_orders INTEGER DEFAULT 0,
ADD COLUMN last_order_date TIMESTAMP WITH TIME ZONE;

-- Créer un index pour améliorer les performances
CREATE INDEX idx_profiles_total_spent ON public.profiles(total_spent);
CREATE INDEX idx_profiles_total_orders ON public.profiles(total_orders);

-- Fonction pour mettre à jour les statistiques client
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si la commande est confirmée et payée
  IF NEW.status = 'confirmed' AND NEW.payment_status = 'paid' AND 
     (OLD.status != 'confirmed' OR OLD.payment_status != 'paid') THEN
    
    -- Mettre à jour les statistiques du client
    UPDATE profiles 
    SET 
      total_spent = COALESCE(total_spent, 0) + NEW.total_amount,
      total_orders = COALESCE(total_orders, 0) + 1,
      last_order_date = NEW.updated_at
    WHERE user_id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour mettre à jour automatiquement les stats
CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- Initialiser les statistiques pour les clients existants
UPDATE profiles 
SET 
  total_spent = COALESCE((
    SELECT SUM(total_amount) 
    FROM orders 
    WHERE orders.user_id = profiles.user_id 
    AND status = 'confirmed' 
    AND payment_status = 'paid'
  ), 0),
  total_orders = COALESCE((
    SELECT COUNT(*) 
    FROM orders 
    WHERE orders.user_id = profiles.user_id 
    AND status = 'confirmed' 
    AND payment_status = 'paid'
  ), 0),
  last_order_date = (
    SELECT MAX(updated_at) 
    FROM orders 
    WHERE orders.user_id = profiles.user_id 
    AND status = 'confirmed' 
    AND payment_status = 'paid'
  );