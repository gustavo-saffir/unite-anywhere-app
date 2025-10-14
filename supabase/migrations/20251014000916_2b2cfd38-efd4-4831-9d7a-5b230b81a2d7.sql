-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to send push notification when message is created
CREATE OR REPLACE FUNCTION public.notify_pastor_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get sender's name
  SELECT full_name INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get environment variables
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Call edge function to send push notification to pastor
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := jsonb_build_object(
      'action', 'send-notification',
      'userId', NEW.pastor_id,
      'title', 'Nova mensagem recebida',
      'body', coalesce(v_sender_name, 'Um discípulo') || ' enviou uma mensagem',
      'url', '/pastor-panel'
    )
  );

  RETURN NEW;
END;
$$;

-- Create function to send push notification when pastor responds
CREATE OR REPLACE FUNCTION public.notify_disciple_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pastor_name TEXT;
  v_pastor_position TEXT;
  v_supabase_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Only trigger when response is added and status changes to 'responded'
  IF NEW.response IS NOT NULL AND OLD.response IS NULL AND NEW.status = 'responded' THEN
    -- Get pastor's name and position
    SELECT full_name, position::TEXT INTO v_pastor_name, v_pastor_position
    FROM public.profiles
    WHERE id = NEW.pastor_id;

    -- Get environment variables
    v_supabase_url := current_setting('app.settings.supabase_url', true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);

    -- Call edge function to send push notification to disciple
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/push-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'action', 'send-notification',
        'userId', NEW.user_id,
        'title', 'Resposta recebida',
        'body', coalesce(v_pastor_name, 'Seu líder') || ' respondeu sua mensagem',
        'url', '/my-messages'
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_notify_pastor_new_message
  AFTER INSERT ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_pastor_new_message();

CREATE TRIGGER trigger_notify_disciple_response
  AFTER UPDATE ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_disciple_response();