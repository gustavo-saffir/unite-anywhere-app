import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, Trash2, Plus, BookOpen } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface Devotional {
  id: string;
  date: string;
  verse_reference: string;
  verse_text: string;
  opening_text: string | null;
  context: string | null;
  central_insight: string | null;
  closing_text: string | null;
  reflection_question: string;
  application_question: string;
  created_at: string;
}

const ManageDevotionals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDevotionals();
  }, []);

  const loadDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar devocionais',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (devotional: Devotional) => {
    navigate('/create-devotional', { state: { devotional } });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Devocional excluído',
        description: 'O devocional foi removido com sucesso.',
      });

      loadDevotionals();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir devocional',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getDateStatus = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'past';
    if (date > today) return 'future';
    return 'today';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'past':
        return <Badge variant="secondary">Passado</Badge>;
      case 'future':
        return <Badge variant="outline">Futuro</Badge>;
      case 'today':
        return <Badge className="bg-primary">Hoje</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Gerenciar Devocionais</h1>
              </div>
            </div>
            <Button onClick={() => navigate('/create-devotional')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Devocional
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Total de {devotionals.length} devocionais cadastrados
          </p>
        </div>

        {devotionals.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum devocional cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando seu primeiro devocional
            </p>
            <Button onClick={() => navigate('/create-devotional')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Devocional
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {devotionals.map((devotional) => {
              const status = getDateStatus(devotional.date);
              const date = new Date(devotional.date + 'T00:00:00');
              
              return (
                <Card key={devotional.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {devotional.verse_reference}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {devotional.verse_text}
                        </p>
                      </div>

                      {devotional.opening_text && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {devotional.opening_text}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(devotional)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(devotional.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este devocional? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageDevotionals;
