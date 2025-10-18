-- Remove duplicate triggers and keep only one per event
-- This migration cleans up duplicate triggers to avoid redundant push notifications

-- Drop duplicate triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_pastor_new_message ON public.pastor_messages;
DROP TRIGGER IF EXISTS on_pastor_message_insert ON public.pastor_messages;
DROP TRIGGER IF EXISTS trigger_notify_disciple_response ON public.pastor_messages;
DROP TRIGGER IF EXISTS on_pastor_message_update ON public.pastor_messages;

-- Recreate only one trigger per event
-- For INSERT: notify pastor when new message arrives
CREATE TRIGGER on_pastor_message_insert
  AFTER INSERT ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_pastor_new_message();

-- For UPDATE: notify disciple when pastor responds
CREATE TRIGGER on_pastor_message_update
  AFTER UPDATE ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_disciple_response();
