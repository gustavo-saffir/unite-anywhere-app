import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, X, User } from 'lucide-react';

interface DailyReadingPastorMessageProps {
  readingId: string;
  readingReference: string;
  onClose: () => void;
}

const DailyReadingPastorMessage = ({ readingId, readingReference, onClose }: DailyReadingPastorMessageProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pastorInfo, setPastorInfo] = useState<{ id: string; full_name: string } | null>(null);
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

      const messageWithContext = `**Leitura: ${readingReference}**\n\n${message.trim()}`;

      const { error } = await supabase
        .from('pastor_messages')
        .insert({
          user_id: user.id,
          pastor_id: pastorInfo.id,
          message: messageWithContext,
          devotional_id: null,
        });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada!',
        description: `Sua mensagem foi enviada para ${pastorInfo.full_name}.`,
      });

      onClose();
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
      <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 shadow-celestial">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mensagem ao Pastor
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Você não está vinculado a nenhum pastor ou líder.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-auto z-50 shadow-celestial">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mensagem ao Pastor
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Envie sua dúvida ou reflexão sobre a leitura para {pastorInfo.full_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium text-muted-foreground">
            Leitura: {readingReference}
          </p>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="min-h-[120px] resize-none"
          disabled={sending}
        />

        <Button
          onClick={handleSendMessage}
          disabled={sending || !message.trim()}
          className="w-full"
        >
          {sending ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-pulse" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar mensagem
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyReadingPastorMessage;
