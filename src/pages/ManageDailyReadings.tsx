import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DailyReading {
  id: string;
  date: string;
  book: string;
  chapter: number;
  chapter_text: string;
  devotional_id: string | null;
}

interface Devotional {
  id: string;
  date: string;
  verse_reference: string;
}

export default function ManageDailyReadings() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    book: '',
    chapter: 1,
    chapter_text: '',
    devotional_id: 'none',
  });

  useEffect(() => {
    loadReadings();
    loadDevotionals();
  }, []);

  const loadReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_readings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar leituras');
    } finally {
      setLoading(false);
    }
  };

  const loadDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('id, date, verse_reference')
        .order('date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar devocionais');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        date: formData.date,
        book: formData.book,
        chapter: formData.chapter,
        chapter_text: formData.chapter_text,
        devotional_id: formData.devotional_id === 'none' ? null : formData.devotional_id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('daily_readings')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Leitura atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('daily_readings')
          .insert([payload]);

        if (error) throw error;
        toast.success('Leitura criada com sucesso!');
      }

      resetForm();
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (reading: DailyReading) => {
    setEditingId(reading.id);
    setFormData({
      date: reading.date,
      book: reading.book,
      chapter: reading.chapter,
      chapter_text: reading.chapter_text,
      devotional_id: reading.devotional_id || 'none',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta leitura?')) return;

    try {
      const { error } = await supabase
        .from('daily_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Leitura excluída com sucesso!');
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      book: '',
      chapter: 1,
      chapter_text: '',
      devotional_id: 'none',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Gerenciar Leituras Diárias</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Leitura' : 'Nova Leitura'}</CardTitle>
              <CardDescription>
                {editingId ? 'Atualize os dados da leitura diária' : 'Crie uma nova leitura diária'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="book">Livro</Label>
                  <Input
                    id="book"
                    value={formData.book}
                    onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                    placeholder="Ex: Gênesis"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="chapter">Capítulo</Label>
                  <Input
                    id="chapter"
                    type="number"
                    min="1"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="devotional">Devocional Relacionado (Opcional)</Label>
                  <Select
                    value={formData.devotional_id}
                    onValueChange={(value) => setFormData({ ...formData, devotional_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um devocional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {devotionals.map((dev) => (
                        <SelectItem key={dev.id} value={dev.id}>
                          {new Date(dev.date).toLocaleDateString('pt-BR')} - {dev.verse_reference}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="chapter_text">Texto do Capítulo</Label>
                  <Textarea
                    id="chapter_text"
                    value={formData.chapter_text}
                    onChange={(e) => setFormData({ ...formData, chapter_text: e.target.value })}
                    placeholder="Cole aqui o texto completo do capítulo..."
                    rows={10}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leituras Cadastradas</CardTitle>
                <CardDescription>
                  {readings.length} {readings.length === 1 ? 'leitura' : 'leituras'}
                </CardDescription>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : readings.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Nenhuma leitura cadastrada ainda
              </Card>
            ) : (
              readings.map((reading) => (
                <Card key={reading.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {reading.book} - Capítulo {reading.chapter}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reading.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {reading.chapter_text}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(reading)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(reading.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
