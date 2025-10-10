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
import { TextEditor } from '@/components/TextEditor';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const devotionalSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  opening_text: z.string().min(10, 'Abertura deve ter no mínimo 10 caracteres'),
  verse_reference: z.string().min(1, 'Referência do versículo é obrigatória'),
  verse_text: z.string().min(10, 'Texto do versículo deve ter no mínimo 10 caracteres'),
  context: z.string().min(10, 'Contexto deve ter no mínimo 10 caracteres'),
  central_insight: z.string().min(10, 'Reflexão central deve ter no mínimo 10 caracteres'),
  reflection_question: z.string().min(10, 'Pergunta de reflexão deve ter no mínimo 10 caracteres'),
  application_question: z.string().min(10, 'Pergunta de aplicação deve ter no mínimo 10 caracteres'),
  closing_text: z.string().min(10, 'Fechamento deve ter no mínimo 10 caracteres'),
});

interface Devotional {
  id: string;
  date: string;
  opening_text: string;
  verse_reference: string;
  verse_text: string;
  context: string;
  central_insight: string;
  reflection_question: string;
  application_question: string;
  closing_text: string;
}

const Admin = () => {
  const [date, setDate] = useState('');
  const [openingText, setOpeningText] = useState('');
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [context, setContext] = useState('');
  const [centralInsight, setCentralInsight] = useState('');
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [applicationQuestion, setApplicationQuestion] = useState('');
  const [closingText, setClosingText] = useState('');
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
        opening_text: openingText,
        verse_reference: verseReference,
        verse_text: verseText,
        context,
        central_insight: centralInsight,
        reflection_question: reflectionQuestion,
        application_question: applicationQuestion,
        closing_text: closingText,
      });

      const { error } = await supabase
        .from('devotionals')
        .insert({
          date: validated.date,
          opening_text: validated.opening_text,
          verse_reference: validated.verse_reference,
          verse_text: validated.verse_text,
          context: validated.context,
          central_insight: validated.central_insight,
          reflection_question: validated.reflection_question,
          application_question: validated.application_question,
          closing_text: validated.closing_text,
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
        setOpeningText('');
        setVerseReference('');
        setVerseText('');
        setContext('');
        setCentralInsight('');
        setReflectionQuestion('');
        setApplicationQuestion('');
        setClosingText('');
        
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
                <Label htmlFor="openingText">Abertura do Devocional</Label>
                <TextEditor
                  id="openingText"
                  value={openingText}
                  onChange={setOpeningText}
                  placeholder="Texto de abertura para introduzir o tema do dia..."
                  rows={3}
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
                <Label htmlFor="context">Contexto Rápido</Label>
                <TextEditor
                  id="context"
                  value={context}
                  onChange={setContext}
                  placeholder="Contexto histórico ou situacional do versículo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="centralInsight">Reflexão Central</Label>
                <TextEditor
                  id="centralInsight"
                  value={centralInsight}
                  onChange={setCentralInsight}
                  placeholder="O insight principal e ensinamento do devocional..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reflectionQuestion">Pergunta de Reflexão</Label>
                <TextEditor
                  id="reflectionQuestion"
                  value={reflectionQuestion}
                  onChange={setReflectionQuestion}
                  placeholder="Pergunta para reflexão pessoal..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationQuestion">Aplicação Prática</Label>
                <TextEditor
                  id="applicationQuestion"
                  value={applicationQuestion}
                  onChange={setApplicationQuestion}
                  placeholder="Como aplicar este ensinamento no dia a dia..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingText">Fechamento do Devocional</Label>
                <TextEditor
                  id="closingText"
                  value={closingText}
                  onChange={setClosingText}
                  placeholder="Texto de encerramento com oração ou pensamento final..."
                  rows={3}
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

          {/* Preview & List Column */}
          <div className="space-y-6">
            {/* Preview Section */}
            <Card className="p-6 shadow-celestial">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Preview do Devocional</h2>
              </div>

              {!verseReference && !verseText && !openingText ? (
                <div className="text-center py-8 text-muted-foreground">
                  Preencha os campos para ver o preview
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Opening */}
                  {openingText && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">📖 Abertura</h4>
                      <MarkdownRenderer 
                        content={openingText} 
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Verse Section */}
                  <div className="text-center space-y-3 p-4 rounded-lg bg-gradient-peaceful/30">
                    <h3 className="text-lg font-semibold text-primary">
                      {verseReference || 'Referência do Versículo'}
                    </h3>
                    <p className="text-foreground/90 italic leading-relaxed">
                      "{verseText || 'Texto do versículo aparecerá aqui...'}"
                    </p>
                  </div>

                  {/* Context */}
                  {context && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">📜 Contexto Rápido</h4>
                      <MarkdownRenderer 
                        content={context} 
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Central Insight */}
                  {centralInsight && (
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-primary">💡 Reflexão Central</h4>
                      <MarkdownRenderer 
                        content={centralInsight} 
                        className="text-sm text-foreground leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Reflection */}
                  {reflectionQuestion && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">💭 Reflexão</h4>
                      <MarkdownRenderer 
                        content={reflectionQuestion} 
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Application */}
                  {applicationQuestion && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">✨ Aplicação Prática</h4>
                      <MarkdownRenderer 
                        content={applicationQuestion} 
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Closing */}
                  {closingText && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">🙏 Fechamento</h4>
                      <MarkdownRenderer 
                        content={closingText} 
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                    </div>
                  )}

                  {date && (
                    <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                      Será publicado em: {new Date(date).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Recent Devotionals List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
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
        </div>
      </main>
    </div>
  );
};

export default Admin;
