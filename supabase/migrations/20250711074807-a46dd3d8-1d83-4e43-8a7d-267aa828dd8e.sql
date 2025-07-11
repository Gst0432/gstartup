-- Fix database error during user registration
-- The notify_new_user_registration function is causing errors because it uses net.http_post
-- which requires the net extension that doesn't exist
-- We'll drop this function since we already have an edge function for user registration

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS on_profiles_insert_notify ON public.profiles;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.notify_new_user_registration();

-- The edge function handle-user-registration already handles user registration notifications
-- so this database trigger is redundant and causing the signup errors