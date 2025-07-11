-- Créer le job CRON pour la vérification automatique des paiements Moneroo
SELECT cron.schedule(
  'auto-verify-payments',
  '*/10 * * * *', -- Toutes les 10 minutes
  $$
  SELECT net.http_post(
    url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-verify-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Mettre à jour la vue pour inclure le nouveau job
DROP VIEW IF EXISTS cron_jobs_status;
CREATE OR REPLACE VIEW cron_jobs_status AS
SELECT 
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname IN ('auto-process-orders', 'auto-process-subscriptions', 'auto-verify-payments');

-- Créer une table pour les logs de vérification automatique
CREATE TABLE IF NOT EXISTS auto_verify_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  total_pending INTEGER DEFAULT 0,
  errors JSONB,
  execution_time INTERVAL,
  success BOOLEAN DEFAULT true
);

-- Politique RLS pour les logs de vérification
ALTER TABLE auto_verify_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view verification logs"
ON auto_verify_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()::text
    AND role = 'admin'
  )
);