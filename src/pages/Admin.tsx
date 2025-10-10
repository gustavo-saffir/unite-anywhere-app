import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const devotionalSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  verse_reference: z.string().min(1, 'Referência do versículo é obrigatória'),
  verse_text: z.string().min(10, 'Texto do versículo deve ter no mínimo 10 caracteres'),
  reflection_question: z.string().min(10, 'Pergunta de reflexão deve ter no mínimo 10 caracteres'),
  application_question: z.string().min(10, 'Pergunta de aplicação deve ter no mínimo 10 caracteres'),
});

interface Devotional {
  id: string;
  date: string;
  verse_reference: string;
  verse_text: string;
  reflection_question: string;
  application_question: string;
}

const Admin = () => {
  const [date, setDate] = useState('');
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [applicationQuestion, setApplicationQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDevotionals();
  }, []);

  const loadDevotionals = async () => {
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: 'Erro ao carregar devocionais',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setDevotionals(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = devotionalSchema.parse({
        date,
        verse_reference: verseReference,
        verse_text: verseText,
        reflection_question: reflectionQuestion,
        application_question: applicationQuestion,
      });

      const { error } = await supabase
        .from('devotionals')
        .insert({
          date: validated.date,
          verse_reference: validated.verse_reference,
          verse_text: validated.verse_text,
          reflection_question: validated.reflection_question,
          application_question: validated.application_question,
          created_by: user?.id,
        });

      if (error) {
        toast({
          title: 'Erro ao criar devocional',
          description: error.message === 'duplicate key value violates unique constraint "devotionals_date_key"'
            ? 'Já existe um devocional para esta data'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Devocional criado com sucesso!',
          description: 'O devocional foi adicionado ao sistema.',
        });
        
        // Reset form
        setDate('');
        setVerseReference('');
        setVerseText('');
        setReflectionQuestion('');
        setApplicationQuestion('');
        
        loadDevotionals();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
              <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Column */}
          <Card className="p-6 shadow-celestial">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Adicionar Devocional</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verseReference">Referência do Versículo</Label>
                <Input
                  id="verseReference"
                  type="text"
                  placeholder="Ex: João 3:16"
                  value={verseReference}
                  onChange={(e) => setVerseReference(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verseText">Texto do Versículo</Label>
                <Textarea
                  id="verseText"
                  placeholder="Digite o texto completo do versículo..."
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reflectionQuestion">Pergunta de Reflexão</Label>
                <Textarea
                  id="reflectionQuestion"
                  placeholder="Pergunta para reflexão pessoal..."
                  value={reflectionQuestion}
                  onChange={(e) => setReflectionQuestion(e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationQuestion">Pergunta de Aplicação</Label>
                <Textarea
                  id="applicationQuestion"
                  placeholder="Como aplicar este ensinamento no dia a dia..."
                  value={applicationQuestion}
                  onChange={(e) => setApplicationQuestion(e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-celestial hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Devocional'}
              </Button>
            </form>
          </Card>

          {/* List Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Devocionais Recentes</h2>
            </div>

            {devotionals.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum devocional cadastrado ainda.</p>
              </Card>
            ) : (
              devotionals.map((devotional) => (
                <Card key={devotional.id} className="p-4 hover:shadow-celestial transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{devotional.verse_reference}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(devotional.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {devotional.verse_text}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
