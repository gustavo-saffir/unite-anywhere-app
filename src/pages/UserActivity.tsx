import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Activity, Search, User, Calendar, BookOpen, Book, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  full_name: string;
  church_denomination: string;
}

interface ActivityRecord {
  id: string;
  user_id: string;
  activity_type: string;
  page_path: string | null;
  metadata: unknown;
  created_at: string;
}

interface UserWithStats {
  profile: UserProfile;
  lastAccess: string | null;
  totalActivities: number;
  devotionalsCompleted: number;
  readingsCompleted: number;
}

const UserActivity = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadUsersWithStats();
  }, [dateFilter]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserActivities(selectedUserId);
    }
  }, [selectedUserId, activityFilter]);

  const loadUsersWithStats = async () => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, church_denomination')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Calculate date range
      const daysAgo = dateFilter === 'all' ? null : parseInt(dateFilter);
      const startDate = daysAgo ? new Date() : null;
      if (startDate && daysAgo) {
        startDate.setDate(startDate.getDate() - daysAgo);
      }

      // Get activity stats for each user
      const usersWithStats: UserWithStats[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get activity counts
          let activitiesQuery = supabase
            .from('user_activity')
            .select('activity_type, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
          
          if (startDate) {
            activitiesQuery = activitiesQuery.gte('created_at', startDate.toISOString());
          }
          
          const { data: activities } = await activitiesQuery;

          // Get devotional completions
          let devotionalQuery = supabase
            .from('user_devotionals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (startDate) {
            devotionalQuery = devotionalQuery.gte('completed_at', startDate.toISOString());
          }
          
          const { count: devotionalCount } = await devotionalQuery;

          // Get reading completions
          let readingQuery = supabase
            .from('user_daily_readings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (startDate) {
            readingQuery = readingQuery.gte('completed_at', startDate.toISOString());
          }
          
          const { count: readingCount } = await readingQuery;

          return {
            profile,
            lastAccess: activities?.[0]?.created_at || null,
            totalActivities: activities?.length || 0,
            devotionalsCompleted: devotionalCount || 0,
            readingsCompleted: readingCount || 0,
          };
        })
      );

      // Sort by last access
      usersWithStats.sort((a, b) => {
        if (!a.lastAccess) return 1;
        if (!b.lastAccess) return -1;
        return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime();
      });

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivities = async (userId: string) => {
    try {
      let query = supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUserActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const getActivityBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'page_view': { label: 'Visualização', variant: 'secondary' },
      'login': { label: 'Login', variant: 'default' },
      'devotional_completed': { label: 'Devocional', variant: 'default' },
      'daily_reading_completed': { label: 'Leitura', variant: 'default' },
      'challenge_started': { label: 'Desafio Iniciado', variant: 'outline' },
      'challenge_completed': { label: 'Desafio Concluído', variant: 'default' },
      'bible_study_viewed': { label: 'Estudo Bíblico', variant: 'secondary' },
      'bible_video_viewed': { label: 'Vídeo Bíblico', variant: 'secondary' },
    };
    return badges[type] || { label: type, variant: 'outline' as const };
  };

  const getPageName = (path: string): string => {
    const routes: Record<string, string> = {
      '/': 'Página Inicial',
      '/dashboard': 'Dashboard',
      '/devotional': 'Devocional',
      '/daily-reading': 'Leitura Diária',
      '/bible-studies': 'Estudos Bíblicos',
      '/bible-videos': 'Vídeos Bíblicos',
      '/settings': 'Configurações',
      '/my-messages': 'Mensagens',
      '/pastor-panel': 'Painel Pastor',
      '/admin': 'Admin',
    };
    return routes[path] || path;
  };

  const filteredUsers = users.filter(u => 
    u.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.profile.church_denomination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find(u => u.profile.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Atividade dos Usuários</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedUserId ? (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo o período</SelectItem>
                    <SelectItem value="1">Últimas 24h</SelectItem>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Users List */}
            <Card>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Carregando usuários...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Igreja</TableHead>
                      <TableHead className="text-center">Último Acesso</TableHead>
                      <TableHead className="text-center">Atividades</TableHead>
                      <TableHead className="text-center">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        Devocionais
                      </TableHead>
                      <TableHead className="text-center">
                        <Book className="w-4 h-4 inline mr-1" />
                        Leituras
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{user.profile.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.profile.church_denomination}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.lastAccess ? (
                            <span className="text-sm">
                              {format(new Date(user.lastAccess), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.totalActivities}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.devotionalsCompleted > 0 ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {user.devotionalsCompleted}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.readingsCompleted > 0 ? (
                            <Badge variant="default" className="bg-blue-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {user.readingsCompleted}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUserId(user.profile.id)}
                          >
                            Ver Histórico
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Detail Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUserId(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedUser?.profile.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedUser?.profile.church_denomination}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{selectedUser?.devotionalsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Devocionais</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser?.readingsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Leituras</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Filter */}
            <Card className="p-4">
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrar atividades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as atividades</SelectItem>
                  <SelectItem value="page_view">Visualizações de página</SelectItem>
                  <SelectItem value="devotional_completed">Devocionais concluídos</SelectItem>
                  <SelectItem value="daily_reading_completed">Leituras concluídas</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Activity List */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Página</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivities.map((activity) => {
                    const badge = getActivityBadge(activity.activity_type);
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell>{activity.page_path ? getPageName(activity.page_path) : '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {activity.metadata && typeof activity.metadata === 'object' && Object.keys(activity.metadata as object).length > 0 ? (
                            <span>{JSON.stringify(activity.metadata)}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {userActivities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhuma atividade encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserActivity;
