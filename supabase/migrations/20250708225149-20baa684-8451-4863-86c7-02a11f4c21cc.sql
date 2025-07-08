-- Ajouter le champ store_slug à la table vendors pour le nouveau système d'URL
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS store_slug TEXT;

-- Créer un index unique pour store_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_store_slug ON vendors(store_slug) WHERE store_slug IS NOT NULL;

-- Mettre à jour le trigger updated_at
CREATE TRIGGER IF NOT EXISTS update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();