import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Schema de validação para mensagens
const messageSchema = z.object({
  content: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(5000, 'Mensagem não pode exceder 5000 caracteres'),
  recipient_id: z.string().uuid('ID de destinatário inválido'),
});

export const useMessages = () => {
  // Sanitizar mensagem
  const sanitizeMessage = (message: string): string => {
    return message
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  };

  // Enviar mensagem
  const sendMessage = async (
    content: string,
    recipientId: string,
    userId: string
  ) => {
    try {
      // VALIDAR
      const validated = messageSchema.parse({
        content,
        recipient_id: recipientId,
      });

      // SANITIZAR
      const sanitizedContent = sanitizeMessage(validated.content);

      // Verificar se usuário existe
      if (!userId) {
        return { 
          error: { message: 'Usuário não autenticado' }, 
          data: null 
        };
      }

      // ENVIAR para Supabase
      // RLS vai verificar permissões automaticamente
      const { error, data } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: validated.recipient_id,
          content: sanitizedContent,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          error: { message: error.errors[0].message }, 
          data: null 
        };
      }
      return { error, data: null };
    }
  };

  // Buscar mensagens recebidas
  const getReceivedMessages = async (userId: string) => {
    try {
      if (!userId) {
        return { error: { message: 'Usuário não autenticado' }, data: null };
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (error) {
      return { error, data: null };
    }
  };

  // Atualizar status da mensagem
  const updateMessageStatus = async (
    messageId: string,
    status: 'pending' | 'read' | 'answered'
  ) => {
    try {
      const validStatuses = ['pending', 'read', 'answered'];
      
      if (!validStatuses.includes(status)) {
        return { 
          error: { message: 'Status inválido' }, 
          data: null 
        };
      }

      const { data, error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (error) {
      return { error, data: null };
    }
  };

  // Adicionar resposta à mensagem
  const addMessageReply = async (
    messageId: string,
    reply: string,
    userId: string
  ) => {
    try {
      // VALIDAR reply
      const validated = z.string()
        .min(1, 'Resposta não pode estar vazia')
        .max(5000, 'Resposta não pode exceder 5000 caracteres')
        .parse(reply);

      // SANITIZAR
      const sanitizedReply = sanitizeMessage(validated);

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          reply: sanitizedReply,
          status: 'answered',
          replied_by: userId,
          replied_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('Erro ao adicionar resposta:', error);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          error: { message: error.errors[0].message }, 
          data: null 
        };
      }
      return { error, data: null };
    }
  };

  return { 
    sendMessage,
    getReceivedMessages,
    updateMessageStatus,
    addMessageReply,
  };
};
