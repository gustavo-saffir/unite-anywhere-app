-- Atualizar a função handle_new_user para definir Gustavo Saffir como pastor padrão para discípulos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_pastor_id uuid := 'e745ff89-8b97-48d9-afc3-b7f6d7a86492'; -- Gustavo Saffir
  user_position user_position;
BEGIN
  user_position := coalesce((new.raw_user_meta_data->>'position')::user_position, 'discipulo');
  
  insert into public.profiles (id, full_name, church_denomination, position, pastor_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'church_denomination', ''),
    user_position,
    CASE 
      WHEN user_position = 'discipulo' THEN default_pastor_id
      ELSE NULL
    END
  );
  
  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$function$;