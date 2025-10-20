import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DailyReadingAIMentorProps {
  readingId: string;
  readingContext: string;
  onClose: () => void;
}

const DailyReadingAIMentor = ({ readingId, readingContext, onClose }: DailyReadingAIMentorProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_mentor_conversations')
        .insert({
          user_id: user.id,
          devotional_id: null, // For daily reading, we don't have devotional_id
        })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);

      setMessages([{
        role: 'assistant',
        content: '🙏 Olá! Sou seu Mentor Espiritual IA. Estou aqui para ajudá-lo a refletir sobre a leitura bíblica de hoje. Como posso ajudá-lo a compreender melhor esta passagem?\n\n*Lembre-se: sou uma ferramenta de apoio, não substituo o papel do seu pastor ou líder espiritual.*'
      }]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a conversa.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor-chat', {
        body: {
          conversationId,
          message: userMessage,
          devotionalContext: readingContext,
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] md:h-[600px] z-50 flex flex-col shadow-celestial">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-celestial">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <h3 className="font-semibold text-primary-foreground">Mentor IA - Leitura</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/20 text-primary-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <MarkdownRenderer 
                    content={message.content} 
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre a leitura..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-gradient-celestial hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DailyReadingAIMentor;
