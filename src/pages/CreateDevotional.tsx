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
import { ArrowLeft, BookOpen, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import bibleIcon from '@/assets/bible-icon.jpg';

const CreateDevotional = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
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

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleConfirmCreate = async () => {
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

      setShowPreview(false);
      
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
            <form onSubmit={handlePreview} className="space-y-6">
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
                <TextEditor
                  id="reflection_question"
                  placeholder="Pergunta para reflexão pessoal"
                  value={formData.reflection_question}
                  onChange={(value) => setFormData({ ...formData, reflection_question: value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="application_question">Pergunta de Aplicação</Label>
                <TextEditor
                  id="application_question"
                  placeholder="Pergunta para aplicação prática"
                  value={formData.application_question}
                  onChange={(value) => setFormData({ ...formData, application_question: value })}
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Preview
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Preview do Devocional
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Abertura */}
              <Card className="p-6 shadow-celestial border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <img src={bibleIcon} alt="Bíblia" className="w-12 h-12 rounded-xl shadow-glow" />
                  <div>
                    <div className="text-sm font-semibold text-accent">Devocional do Dia</div>
                    <h2 className="text-xl font-bold text-foreground">📖 Abertura</h2>
                  </div>
                </div>
                {formData.opening_text ? (
                  <MarkdownRenderer 
                    content={formData.opening_text} 
                    className="text-foreground leading-relaxed"
                  />
                ) : (
                  <p className="text-muted-foreground">Texto de abertura não preenchido.</p>
                )}
              </Card>

              {/* Versículo */}
              <Card className="p-6 shadow-celestial border-primary/20">
                <h2 className="text-xl font-bold text-foreground mb-4">📖 Versículo do Dia</h2>
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {formData.verse_reference || 'Referência não preenchida'}
                  </h3>
                  <p className="text-lg text-foreground leading-relaxed italic">
                    "{formData.verse_text || 'Texto do versículo não preenchido'}"
                  </p>
                </div>
              </Card>

              {/* Contexto */}
              <Card className="p-6 shadow-celestial">
                <h2 className="text-xl font-bold text-foreground mb-4">📜 Contexto Rápido</h2>
                {formData.context ? (
                  <MarkdownRenderer 
                    content={formData.context} 
                    className="text-foreground leading-relaxed"
                  />
                ) : (
                  <p className="text-muted-foreground">Contexto não preenchido.</p>
                )}
              </Card>

              {/* Insight Central */}
              <Card className="p-6 shadow-celestial">
                <h2 className="text-xl font-bold text-foreground mb-4">💡 Reflexão Central</h2>
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                  {formData.central_insight ? (
                    <MarkdownRenderer 
                      content={formData.central_insight} 
                      className="text-foreground leading-relaxed"
                    />
                  ) : (
                    <p className="text-muted-foreground">Insight central não preenchido.</p>
                  )}
                </div>
              </Card>

              {/* Encerramento */}
              <Card className="p-6 shadow-celestial">
                <h2 className="text-xl font-bold text-foreground mb-4">🙏 Encerramento</h2>
                {formData.closing_text ? (
                  <MarkdownRenderer 
                    content={formData.closing_text} 
                    className="text-foreground leading-relaxed"
                  />
                ) : (
                  <p className="text-muted-foreground">Texto de encerramento não preenchido.</p>
                )}
              </Card>

              {/* Perguntas */}
              <Card className="p-6 shadow-celestial">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">🤔 Pergunta de Reflexão</h3>
                    {formData.reflection_question ? (
                      <MarkdownRenderer 
                        content={formData.reflection_question} 
                        className="text-foreground leading-relaxed"
                      />
                    ) : (
                      <p className="text-muted-foreground">Não preenchida</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">✨ Pergunta de Aplicação</h3>
                    {formData.application_question ? (
                      <MarkdownRenderer 
                        content={formData.application_question} 
                        className="text-foreground leading-relaxed"
                      />
                    ) : (
                      <p className="text-muted-foreground">Não preenchida</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
              disabled={loading}
            >
              Voltar para Editar
            </Button>
            <Button 
              onClick={handleConfirmCreate}
              disabled={loading}
              className="bg-gradient-celestial hover:opacity-90"
            >
              {loading ? 'Criando...' : 'Confirmar e Criar Devocional'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateDevotional;
