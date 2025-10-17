-- Use correct schema for http_post
CREATE OR REPLACE FUNCTION public.notify_disciple_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pastor_name TEXT;
  v_url TEXT := 'https://kxlgecrhypiozlvjkoon.supabase.co/functions/v1/push-notifications';
BEGIN
  IF NEW.response IS NOT NULL AND (OLD.response IS NULL OR OLD.response = '') AND NEW.status = 'responded' THEN
    SELECT full_name INTO v_pastor_name
    FROM public.profiles
    WHERE id = NEW.pastor_id;

    PERFORM
      net.http_post(
        url := v_url,
        body := jsonb_build_object(
          'action', 'send-notification',
          'userId', NEW.user_id::text,
          'title', 'Resposta recebida',
          'body', coalesce(v_pastor_name, 'Seu líder') || ' respondeu sua mensagem',
          'url', '/my-messages'
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
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
  v_url TEXT := 'https://kxlgecrhypiozlvjkoon.supabase.co/functions/v1/push-notifications';
BEGIN
  SELECT full_name INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  PERFORM
    net.http_post(
      url := v_url,
      body := jsonb_build_object(
        'action', 'send-notification',
        'userId', NEW.pastor_id::text,
        'title', 'Nova mensagem recebida',
        'body', coalesce(v_sender_name, 'Um discípulo') || ' enviou uma mensagem',
        'url', '/pastor-panel'
      ),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;