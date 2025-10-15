import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextEditor } from '@/components/TextEditor';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const CreateDevotional = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    verse_reference: '',
    verse_text: '',
    opening_text: '',
    context: '',
    central_insight: '',
    closing_text: '',
    reflection_question: '',
    application_question: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('devotionals')
        .insert([{
          ...formData,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: 'Devocional criado com sucesso!',
        description: 'O devocional foi adicionado à plataforma.',
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        verse_reference: '',
        verse_text: '',
        opening_text: '',
        context: '',
        central_insight: '',
        closing_text: '',
        reflection_question: '',
        application_question: ''
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar devocional',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Criar Devocional</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Novo Devocional Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="verse_reference">Referência do Versículo</Label>
                <Input
                  id="verse_reference"
                  placeholder="Ex: João 3:16"
                  value={formData.verse_reference}
                  onChange={(e) => setFormData({ ...formData, verse_reference: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="verse_text">Texto do Versículo</Label>
                <Textarea
                  id="verse_text"
                  placeholder="Digite o texto completo do versículo"
                  value={formData.verse_text}
                  onChange={(e) => setFormData({ ...formData, verse_text: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="opening_text">Texto de Abertura</Label>
                <TextEditor
                  id="opening_text"
                  placeholder="Introdução do devocional"
                  value={formData.opening_text}
                  onChange={(value) => setFormData({ ...formData, opening_text: value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="context">Contexto</Label>
                <TextEditor
                  id="context"
                  placeholder="Contexto histórico e cultural"
                  value={formData.context}
                  onChange={(value) => setFormData({ ...formData, context: value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="central_insight">Insight Central</Label>
                <TextEditor
                  id="central_insight"
                  placeholder="Mensagem principal do devocional"
                  value={formData.central_insight}
                  onChange={(value) => setFormData({ ...formData, central_insight: value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="closing_text">Texto de Encerramento</Label>
                <TextEditor
                  id="closing_text"
                  placeholder="Conclusão e encorajamento final"
                  value={formData.closing_text}
                  onChange={(value) => setFormData({ ...formData, closing_text: value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="reflection_question">Pergunta de Reflexão</Label>
                <Textarea
                  id="reflection_question"
                  placeholder="Pergunta para reflexão pessoal"
                  value={formData.reflection_question}
                  onChange={(e) => setFormData({ ...formData, reflection_question: e.target.value })}
                  required
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="application_question">Pergunta de Aplicação</Label>
                <Textarea
                  id="application_question"
                  placeholder="Pergunta para aplicação prática"
                  value={formData.application_question}
                  onChange={(e) => setFormData({ ...formData, application_question: e.target.value })}
                  required
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Criando...' : 'Criar Devocional'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateDevotional;
