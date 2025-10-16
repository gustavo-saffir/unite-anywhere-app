-- Ensure pg_net is available under the correct schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Fix function to use extensions.http_post instead of non-existent net.http_post
CREATE OR REPLACE FUNCTION public.notify_disciple_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pastor_name TEXT;
BEGIN
  -- Only trigger when response is added and status changes to 'responded'
  IF NEW.response IS NOT NULL AND (OLD.response IS NULL OR OLD.response = '') AND NEW.status = 'responded' THEN
    -- Get pastor's name
    SELECT full_name INTO v_pastor_name
    FROM public.profiles
    WHERE id = NEW.pastor_id;

    -- Call edge function to send push notification to disciple
    PERFORM
      extensions.http_post(
        url := current_setting('app.settings.supabase_url'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'action', 'send-notification',
          'userId', NEW.user_id::text,
          'title', 'Resposta recebida',
          'body', coalesce(v_pastor_name, 'Seu líder') || ' respondeu sua mensagem',
          'url', '/my-messages'
        ) || jsonb_build_object('path', '/functions/v1/push-notifications')
      );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the update
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix function to use extensions.http_post instead of non-existent net.http_post
CREATE OR REPLACE FUNCTION public.notify_pastor_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  -- Get sender's name
  SELECT full_name INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Call edge function to send push notification to pastor
  PERFORM
    extensions.http_post(
      url := current_setting('app.settings.supabase_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'action', 'send-notification',
        'userId', NEW.pastor_id::text,
        'title', 'Nova mensagem recebida',
        'body', coalesce(v_sender_name, 'Um discípulo') || ' enviou uma mensagem',
        'url', '/pastor-panel'
      ) || jsonb_build_object('path', '/functions/v1/push-notifications')
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;