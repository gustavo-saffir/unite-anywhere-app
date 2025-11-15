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
  book: string;
  devotional_id: string | null;
  chapters: {
    id: string;
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
    book: '',
    chapters: [
      { chapter: 1, chapter_text: '' },
      { chapter: 2, chapter_text: '' },
      { chapter: 3, chapter_text: '' },
      { chapter: 4, chapter_text: '' },
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
        const existingGroup = grouped.find(g => g.date === reading.date && g.book === reading.book);
        if (existingGroup) {
          existingGroup.chapters.push({
            id: reading.id,
            chapter: reading.chapter,
            chapter_text: reading.chapter_text,
          });
        } else {
          grouped.push({
            date: reading.date,
            book: reading.book,
            devotional_id: reading.devotional_id,
            chapters: [{
              id: reading.id,
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
      
      // Filter out empty chapters
      const validChapters = formData.chapters.filter(ch => ch.chapter_text.trim() !== '');
      
      if (validChapters.length === 0) {
        toast.error('Preencha pelo menos um capítulo');
        return;
      }

      if (editingDate) {
        // Delete existing readings for this date
        const { error: deleteError } = await supabase
          .from('daily_readings')
          .delete()
          .eq('date', editingDate)
          .eq('book', formData.book);

        if (deleteError) throw deleteError;
      }

      // Insert all chapters
      const inserts = validChapters.map((ch, index) => ({
        date: formData.date,
        book: formData.book,
        chapter: ch.chapter,
        chapter_text: ch.chapter_text,
        devotional_id: devotionalId,
      }));

      const { error } = await supabase
        .from('daily_readings')
        .insert(inserts);

      if (error) throw error;
      
      toast.success(editingDate ? 'Leitura atualizada com sucesso!' : 'Leitura criada com sucesso!');
      resetForm();
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (group: DailyReadingGroup) => {
    setEditingDate(group.date);
    
    const chapters = [
      { chapter: 1, chapter_text: '' },
      { chapter: 2, chapter_text: '' },
      { chapter: 3, chapter_text: '' },
      { chapter: 4, chapter_text: '' },
    ];
    
    group.chapters.forEach((ch, index) => {
      if (index < 4) {
        chapters[index] = {
          chapter: ch.chapter,
          chapter_text: ch.chapter_text,
        };
      }
    });
    
    setFormData({
      date: group.date,
      book: group.book,
      chapters: chapters,
      devotional_id: group.devotional_id || 'none',
    });
  };

  const handleDelete = async (group: DailyReadingGroup) => {
    if (!confirm('Tem certeza que deseja excluir esta leitura (todos os capítulos)?')) return;

    try {
      const { error } = await supabase
        .from('daily_readings')
        .delete()
        .eq('date', group.date)
        .eq('book', group.book);

      if (error) throw error;
      toast.success('Leitura excluída com sucesso!');
      loadReadings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingDate(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      book: '',
      chapters: [
        { chapter: 1, chapter_text: '' },
        { chapter: 2, chapter_text: '' },
        { chapter: 3, chapter_text: '' },
        { chapter: 4, chapter_text: '' },
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
              <CardTitle>{editingDate ? 'Editar Leitura' : 'Nova Leitura Diária'}</CardTitle>
              <CardDescription>
                {editingDate ? 'Atualize os dados da leitura diária (até 4 capítulos)' : 'Crie uma nova leitura diária (até 4 capítulos)'}
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
                  {formData.chapters.map((chapter, index) => (
                    <div key={index} className="space-y-2 p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-semibold">Capítulo {index + 1}</Label>
                      </div>
                      
                      <div>
                        <Label htmlFor={`chapter-${index}`}>Número do Capítulo</Label>
                        <Input
                          id={`chapter-${index}`}
                          type="number"
                          min="1"
                          value={chapter.chapter}
                          onChange={(e) => {
                            const newChapters = [...formData.chapters];
                            newChapters[index].chapter = parseInt(e.target.value) || 1;
                            setFormData({ ...formData, chapters: newChapters });
                          }}
                          required={index === 0}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`text-${index}`}>Texto do Capítulo</Label>
                        <Textarea
                          id={`text-${index}`}
                          value={chapter.chapter_text}
                          onChange={(e) => {
                            const newChapters = [...formData.chapters];
                            newChapters[index].chapter_text = e.target.value;
                            setFormData({ ...formData, chapters: newChapters });
                          }}
                          placeholder={`Cole aqui o texto do capítulo ${index + 1}...`}
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
                  <Card key={`${group.date}-${group.book}-${idx}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {group.book} - {group.chapters.length} {group.chapters.length === 1 ? 'Capítulo' : 'Capítulos'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {dateFormatted}
                          </p>
                          <div className="space-y-1">
                            {group.chapters.map((ch) => (
                              <p key={ch.id} className="text-sm text-muted-foreground">
                                Cap. {ch.chapter}: {ch.chapter_text.substring(0, 80)}...
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
