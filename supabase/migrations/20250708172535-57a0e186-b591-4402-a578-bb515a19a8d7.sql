-- Permettre aux utilisateurs de supprimer leurs propres commandes
CREATE POLICY "Users can delete their own orders" 
ON orders 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()::text 
  AND profiles.user_id = orders.user_id
));

-- Permettre aux utilisateurs de supprimer leurs propres avis
CREATE POLICY "Users can delete their own reviews" 
ON reviews 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()::text 
  AND profiles.user_id = reviews.user_id
));