-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer une tâche cron pour traiter automatiquement les commandes toutes les 5 minutes
SELECT cron.schedule(
  'auto-process-orders',
  '*/5 * * * *', -- Toutes les 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-process-orders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Créer une table pour suivre les traitements automatiques
CREATE TABLE IF NOT EXISTS public.auto_process_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_orders INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  errors JSONB,
  execution_time INTERVAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS sur la table des logs
ALTER TABLE public.auto_process_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les logs
CREATE POLICY "Admins can view all auto process logs" ON public.auto_process_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid()::text 
      AND role = 'admin'
    )
  );