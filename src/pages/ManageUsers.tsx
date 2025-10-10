import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Users, Save, ArrowLeft } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  pastor_id: string | null;
  church_denomination: string;
  position: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [pastors, setPastors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Buscar todos os usuários
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (usersError) throw usersError;

      // Separar pastores dos demais usuários
      const pastorsList = allUsers?.filter(u => u.position === 'pastor' || u.position === 'lider') || [];
      const usersList = allUsers?.filter(u => u.position === 'discipulo') || [];

      setPastors(pastorsList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePastor = async (userId: string, pastorId: string | null) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pastor_id: pastorId })
        .eq('id', userId);

      if (error) throw error;

      // Atualizar o estado local imediatamente
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, pastor_id: pastorId } : u
        )
      );

      toast({
        title: 'Sucesso!',
        description: 'Pastor vinculado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating pastor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular o pastor.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Gerenciar Usuários</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 shadow-celestial">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Vincular Discípulos aos Pastores</h2>
            <p className="text-sm text-muted-foreground">
              Selecione um pastor/líder para cada discípulo. Isso permitirá que o discípulo envie mensagens diretas.
            </p>
          </div>

          {pastors.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Não há pastores ou líderes cadastrados. Atualize o perfil dos pastores para position="pastor" ou "lider" primeiro.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.church_denomination}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-64">
                      <Select
                        key={`${user.id}-${user.pastor_id}`}
                        value={user.pastor_id || 'none'}
                        onValueChange={(value) => handleUpdatePastor(user.id, value === 'none' ? null : value)}
                        disabled={saving || pastors.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um pastor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum pastor</SelectItem>
                          {pastors.map((pastor) => (
                            <SelectItem key={pastor.id} value={pastor.id}>
                              {pastor.full_name} ({pastor.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum discípulo cadastrado ainda.</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default ManageUsers;