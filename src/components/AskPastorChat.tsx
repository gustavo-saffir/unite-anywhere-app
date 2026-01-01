import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Send, X, Clock, AlertCircle } from 'lucide-react';
import { TextEditor } from '@/components/TextEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AskPastorChatProps {
  onClose: () => void;
}

const AskPastorChat = ({ onClose }: AskPastorChatProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [pastorInfo, setPastorInfo] = useState<{ id: string; full_name: string; pastor_position: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPastorInfo();
  }, []);

  const loadPastorInfo = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_my_pastor_info')
        .single();

      if (error) throw error;
      setPastorInfo(data);
    } catch (error) {
      console.error('Error loading pastor info:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !pastorInfo) return;

    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('pastor_messages')
        .insert({
          user_id: user.id,
          pastor_id: pastorInfo.id,
          message: message.trim(),
          devotional_id: null,
        });

      if (error) throw error;

      // Send push notification to pastor
      try {
        await supabase.functions.invoke('push-notifications', {
          body: {
            userId: pastorInfo.id,
            title: 'Nova pergunta recebida',
            body: 'Você recebeu uma nova pergunta de um discípulo.',
          },
        });
      } catch (pushError) {
        console.log('Push notification not sent:', pushError);
      }

      setMessageSent(true);
      toast({
        title: 'Mensagem enviada!',
        description: `Sua pergunta foi enviada para ${pastorInfo.full_name}.`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (!pastorInfo) {
    return (
      <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 flex flex-col shadow-celestial">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-secondary to-accent">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary-foreground" />
            <h3 className="font-semibold text-secondary-foreground">Pergunte ao Pastor</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/20 text-secondary-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Você não está vinculado a nenhum pastor ou líder.
          </p>
        </div>
      </Card>
    );
  }

  if (messageSent) {
    return (
      <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 flex flex-col shadow-celestial">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-secondary to-accent">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary-foreground" />
            <h3 className="font-semibold text-secondary-foreground">Pergunte ao Pastor</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/20 text-secondary-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-foreground">Mensagem Enviada!</h4>
          <p className="text-sm text-muted-foreground">
            Sua pergunta foi enviada para {pastorInfo.full_name}. Você receberá uma resposta em até 24 horas.
          </p>
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 flex flex-col shadow-celestial">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-secondary to-accent">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-secondary-foreground" />
          <h3 className="font-semibold text-secondary-foreground">Pergunte ao Pastor</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/20 text-secondary-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="text-center pb-2">
          <p className="text-sm text-muted-foreground">
            Envie sua dúvida ou reflexão para <span className="font-medium text-foreground">{pastorInfo.full_name}</span>
          </p>
          <p className="text-xs text-muted-foreground capitalize">({pastorInfo.pastor_position})</p>
        </div>

        {/* Response time notice */}
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
            O tempo de resposta é de até <strong>24 horas</strong>. Você será notificado quando receber uma resposta.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <TextEditor
            value={message}
            onChange={setMessage}
            placeholder="Digite sua pergunta ou reflexão..."
            rows={6}
          />
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={sending || !message.trim()}
          className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90"
        >
          {sending ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-pulse" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Pergunta
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default AskPastorChat;
