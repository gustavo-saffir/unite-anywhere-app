-- Create trigger for notifying pastor when disciple sends message
DROP TRIGGER IF EXISTS on_pastor_message_insert ON public.pastor_messages;
CREATE TRIGGER on_pastor_message_insert
  AFTER INSERT ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_pastor_new_message();

-- Create trigger for notifying disciple when pastor responds
DROP TRIGGER IF EXISTS on_pastor_message_response ON public.pastor_messages;
CREATE TRIGGER on_pastor_message_response
  AFTER UPDATE ON public.pastor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_disciple_response();