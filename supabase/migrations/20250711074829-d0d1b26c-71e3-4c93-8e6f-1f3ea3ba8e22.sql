-- Fix database error during user registration
-- Drop the trigger that depends on the problematic function
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;

-- Now drop the problematic function that uses net.http_post
DROP FUNCTION IF EXISTS public.notify_new_user_registration();

-- The edge function handle-user-registration already handles user registration notifications
-- so this database trigger was redundant and causing signup errors