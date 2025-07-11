-- Activer les extensions nécessaires pour l'automatisation
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programmer l'exécution automatique de la fonction de réconciliation toutes les 10 minutes
SELECT cron.schedule(
  'auto-process-orders',
  '*/10 * * * *', -- Toutes les 10 minutes
  $$
  SELECT net.http_post(
    url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-process-orders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Programmer l'exécution automatique des abonnements vendeurs toutes les heures
SELECT cron.schedule(
  'auto-process-subscriptions',
  '0 * * * *', -- Chaque heure
  $$
  SELECT net.http_post(
    url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-process-subscriptions',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Créer une vue pour monitorer les cron jobs
CREATE OR REPLACE VIEW cron_jobs_status AS
SELECT 
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname IN ('auto-process-orders', 'auto-process-subscriptions');

-- Donner accès en lecture à cette vue aux admins
GRANT SELECT ON cron_jobs_status TO authenticated;