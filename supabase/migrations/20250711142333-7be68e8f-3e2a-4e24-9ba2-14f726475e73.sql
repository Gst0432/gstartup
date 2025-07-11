-- Créer des tâches cron pour automatiser le traitement des commandes et abonnements

-- Programmer l'auto-process des commandes toutes les 5 minutes
SELECT cron.schedule(
  'auto-process-orders',
  '*/5 * * * *', -- Toutes les 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-process-orders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Programmer l'auto-process des abonnements toutes les 10 minutes
SELECT cron.schedule(
  'auto-process-subscriptions',
  '*/10 * * * *', -- Toutes les 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/auto-process-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Programmer la réconciliation des commandes bloquées toutes les heures
SELECT cron.schedule(
  'reconcile-orders',
  '0 * * * *', -- Toutes les heures
  $$
  SELECT
    net.http_post(
        url:='https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/reconcile-orders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTUxNTYsImV4cCI6MjA1MTEzMTE1Nn0.epAlSQhSADv1BqZk4jYS1gsfqZTvNlKqGduFKzpARfc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);