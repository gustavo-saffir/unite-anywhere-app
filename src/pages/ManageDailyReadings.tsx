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

interface DailyReadingGroup {
  date: string;
  devotional_id: string | null;
  readings: {
    id: string;
    book: string;
    chapter: number;
    chapter_text: string;
  }[];
}

interface Devotional {
  id: string;
  date: string;
  verse_reference: string;
}

export default function ManageDailyReadings() {
  const navigate = useNavigate();
  const [readingGroups, setReadingGroups] = useState<DailyReadingGroup[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    readings: [
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
    ],
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
        .order('date', { ascending: false })
        .order('chapter', { ascending: true });

      if (error) throw error;
      
      // Group readings by date
      const grouped: DailyReadingGroup[] = [];
      const readingsData = data || [];
      
      readingsData.forEach((reading) => {
        const existingGroup = grouped.find(g => g.date === reading.date);
        if (existingGroup) {
          existingGroup.readings.push({
            id: reading.id,
            book: reading.book,
            chapter: reading.chapter,
            chapter_text: reading.chapter_text,
          });
        } else {
          grouped.push({
            date: reading.date,
            devotional_id: reading.devotional_id,
            readings: [{
              id: reading.id,
              book: reading.book,
              chapter: reading.chapter,
              chapter_text: reading.chapter_text,
            }],
          });
        }
      });
      
      setReadingGroups(grouped);
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
      const devotionalId = formData.devotional_id === 'none' ? null : formData.devotional_id;
      
      // Filter out empty readings
      const validReadings = formData.readings.filter(r => r.book.trim() !== '' && r.chapter_text.trim() !== '');
      
      if (validReadings.length === 0) {
        toast.error('Preencha pelo menos uma leitura');
        return;
      }

      if (editingDate) {
        // Delete existing readings for this date
        const { error: deleteError } = await supabase
          .from('daily_readings')
          .delete()
          .eq('date', editingDate);

        if (deleteError) throw deleteError;
      }

      // Insert all readings
      const inserts = validReadings.map((reading) => ({
        date: formData.date,
        book: reading.book,
        chapter: reading.chapter,
        chapter_text: reading.chapter_text,
        devotional_id: devotionalId,
      }));

      const { error } = await supabase
        .from('daily_readings')
        .insert(inserts);

      if (error) throw error;
      
      toast.success(editingDate ? 'Leituras atualizadas com sucesso!' : 'Leituras criadas com sucesso!');
      resetForm();
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (group: DailyReadingGroup) => {
    setEditingDate(group.date);
    
    const readings = [
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
      { book: '', chapter: 1, chapter_text: '' },
    ];
    
    group.readings.forEach((reading, index) => {
      if (index < 4) {
        readings[index] = {
          book: reading.book,
          chapter: reading.chapter,
          chapter_text: reading.chapter_text,
        };
      }
    });
    
    setFormData({
      date: group.date,
      readings: readings,
      devotional_id: group.devotional_id || 'none',
    });
  };

  const handleDelete = async (group: DailyReadingGroup) => {
    if (!confirm('Tem certeza que deseja excluir todas as leituras desta data?')) return;

    try {
      const { error } = await supabase
        .from('daily_readings')
        .delete()
        .eq('date', group.date);

      if (error) throw error;
      toast.success('Leituras excluídas com sucesso!');
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingDate(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      readings: [
        { book: '', chapter: 1, chapter_text: '' },
        { book: '', chapter: 1, chapter_text: '' },
        { book: '', chapter: 1, chapter_text: '' },
        { book: '', chapter: 1, chapter_text: '' },
      ],
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
              <CardTitle>{editingDate ? 'Editar Leituras' : 'Novas Leituras Diárias'}</CardTitle>
              <CardDescription>
                {editingDate ? 'Atualize as leituras do dia (até 4 leituras de livros diferentes)' : 'Crie novas leituras para o dia (até 4 leituras de livros diferentes)'}
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
                          {dev.date} - {dev.verse_reference}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {formData.readings.map((reading, index) => (
                    <div key={index} className="space-y-2 p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-semibold">Leitura {index + 1}</Label>
                      </div>
                      
                      <div>
                        <Label htmlFor={`book-${index}`}>Livro</Label>
                        <Input
                          id={`book-${index}`}
                          value={reading.book}
                          onChange={(e) => {
                            const newReadings = [...formData.readings];
                            newReadings[index].book = e.target.value;
                            setFormData({ ...formData, readings: newReadings });
                          }}
                          placeholder="Ex: Gênesis"
                          required={index === 0}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`chapter-${index}`}>Número do Capítulo</Label>
                        <Input
                          id={`chapter-${index}`}
                          type="number"
                          min="1"
                          value={reading.chapter}
                          onChange={(e) => {
                            const newReadings = [...formData.readings];
                            newReadings[index].chapter = parseInt(e.target.value) || 1;
                            setFormData({ ...formData, readings: newReadings });
                          }}
                          required={index === 0}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`text-${index}`}>Texto do Capítulo</Label>
                        <Textarea
                          id={`text-${index}`}
                          value={reading.chapter_text}
                          onChange={(e) => {
                            const newReadings = [...formData.readings];
                            newReadings[index].chapter_text = e.target.value;
                            setFormData({ ...formData, readings: newReadings });
                          }}
                          placeholder={`Cole aqui o texto completo do capítulo ${index + 1}...`}
                          rows={6}
                          required={index === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingDate ? 'Atualizar' : 'Criar'}
                  </Button>
                  {editingDate && (
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
                  {readingGroups.length} {readingGroups.length === 1 ? 'leitura' : 'leituras'}
                </CardDescription>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : readingGroups.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Nenhuma leitura cadastrada ainda
              </Card>
            ) : (
              readingGroups.map((group, idx) => {
                // Format date without timezone issues
                const [year, month, day] = group.date.split('-');
                const dateFormatted = `${day}/${month}/${year}`;
                
                return (
                  <Card key={`${group.date}-${idx}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            Leituras do Dia - {group.readings.length} {group.readings.length === 1 ? 'Leitura' : 'Leituras'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {dateFormatted}
                          </p>
                          <div className="space-y-1">
                            {group.readings.map((reading) => (
                              <p key={reading.id} className="text-sm text-muted-foreground">
                                {reading.book} - Cap. {reading.chapter}: {reading.chapter_text.substring(0, 60)}...
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(group)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(group)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
