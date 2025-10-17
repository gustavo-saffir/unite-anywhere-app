-- Update functions to remove Authorization header since Edge Function is public
CREATE OR REPLACE FUNCTION public.notify_disciple_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pastor_name TEXT;
BEGIN
  IF NEW.response IS NOT NULL AND (OLD.response IS NULL OR OLD.response = '') AND NEW.status = 'responded' THEN
    SELECT full_name INTO v_pastor_name
    FROM public.profiles
    WHERE id = NEW.pastor_id;

    PERFORM
      extensions.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/push-notifications',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'action', 'send-notification',
          'userId', NEW.user_id::text,
          'title', 'Resposta recebida',
          'body', coalesce(v_pastor_name, 'Seu líder') || ' respondeu sua mensagem',
          'url', '/my-messages'
        )
      );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_pastor_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  SELECT full_name INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  PERFORM
    extensions.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/push-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'action', 'send-notification',
        'userId', NEW.pastor_id::text,
        'title', 'Nova mensagem recebida',
        'body', coalesce(v_sender_name, 'Um discípulo') || ' enviou uma mensagem',
        'url', '/pastor-panel'
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;