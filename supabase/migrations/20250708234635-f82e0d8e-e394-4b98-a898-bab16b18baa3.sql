-- Créer une fonction pour notifier les nouvelles inscriptions
CREATE OR REPLACE FUNCTION notify_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction edge pour envoyer une notification par email
  PERFORM
    net.http_post(
      url := 'https://lrmgewuhgekxsgzuqcja.supabase.co/functions/v1/send-email-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWdld3VoZ2VreHNnenVxY2phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1NTE1NiwiZXhwIjoyMDUxMTMxMTU2fQ.F3LqVA_KKICtqGKP4FYuJKOb8hswOuLAdFLn4t5jnLs"}'::jsonb,
      body := json_build_object(
        'type', 'user_registration',
        'to', 'contact@gstartup.pro',
        'data', json_build_object(
          'display_name', NEW.display_name,
          'email', NEW.email,
          'role', NEW.role,
          'phone', NEW.phone,
          'user_id', NEW.user_id
        )
      )::text::jsonb
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table profiles
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user_registration();