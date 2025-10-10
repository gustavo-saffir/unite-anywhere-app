import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  LogOut,
  Shield
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import DailyDevotionalCard from "@/components/DailyDevotionalCard";
import PastorNotifications from "@/components/PastorNotifications";
import GeneralMentorChat from "@/components/GeneralMentorChat";
import ChallengesList from "@/components/ChallengesList";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { useUserStats } from "@/hooks/useUserStats";
import { useSpiritualGoals } from "@/hooks/useSpiritualGoals";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [showMentorChat, setShowMentorChat] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const { stats, loading: statsLoading, getXPProgressPercentage } = useUserStats();
  const { goals, loading: goalsLoading } = useSpiritualGoals();
  const navigate = useNavigate();
  const [userPosition, setUserPosition] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('position')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setUserPosition(data.position);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userName = user?.user_metadata?.full_name || 'Usuário';

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bem-vindo de volta, {userName}!</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="outline" className="border-primary/30" asChild>
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              {(userPosition === 'pastor' || userPosition === 'lider') && (
                <Button variant="outline" className="border-primary/30" asChild>
                  <Link to="/pastor-panel">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Painel Pastor
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="border-primary/30" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Devotional Card */}
            <DailyDevotionalCard />

            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {statsLoading ? '-' : stats?.current_streak || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                <Progress 
                  value={statsLoading ? 0 : Math.min(((stats?.current_streak || 0) / 7) * 100, 100)} 
                  className="mt-2 h-2" 
                />
              </Card>

              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-2xl font-bold text-secondary">
                    {statsLoading ? '-' : stats?.total_xp || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">XP Total</p>
                <Progress 
                  value={statsLoading ? 0 : getXPProgressPercentage()} 
                  className="mt-2 h-2" 
                />
              </Card>

              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-2xl font-bold text-accent">
                    {statsLoading ? '-' : `Nível ${stats?.current_level || 1}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {statsLoading ? 'Carregando...' : stats?.current_level === 1 ? 'Iniciante' : 'Progredindo'}
                </p>
                <Progress 
                  value={statsLoading ? 0 : getXPProgressPercentage()} 
                  className="mt-2 h-2" 
                />
              </Card>
            </div>

            {/* Weekly Calendar */}
            <WeeklyCalendar />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Spiritual Goals */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Objetivos Espirituais</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Leitura Bíblica</span>
                    <span className="text-muted-foreground">{goalsLoading ? '-' : `${goals.reading}%`}</span>
                  </div>
                  <Progress value={goalsLoading ? 0 : goals.reading} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Oração Diária</span>
                    <span className="text-muted-foreground">{goalsLoading ? '-' : `${goals.prayer}%`}</span>
                  </div>
                  <Progress value={goalsLoading ? 0 : goals.prayer} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Memorização</span>
                    <span className="text-muted-foreground">{goalsLoading ? '-' : `${goals.memorization}%`}</span>
                  </div>
                  <Progress value={goalsLoading ? 0 : goals.memorization} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Mentor Chat */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Mentor Virtual</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tem dúvidas sobre o devocional de hoje? Converse com seu mentor virtual 24/7!
              </p>
              <Button 
                className="w-full bg-gradient-celestial hover:opacity-90"
                onClick={() => setShowMentorChat(true)}
              >
                Iniciar Conversa
              </Button>
            </Card>

            {/* Bible Access */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Bíblia Online</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse a Bíblia completa em NVI. Leia, pesquise e aprofunde-se na Palavra de Deus.
              </p>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link to="/bible">
                  📖 Ler a Bíblia
                </Link>
              </Button>
            </Card>

            {/* Mensagens do Pastor/Líder */}
            {userPosition === 'discipulo' && (
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">Mensagens</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Veja as respostas do seu pastor/líder às suas perguntas sobre os devocionais.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-secondary/30"
                  asChild
                >
                  <Link to="/my-messages">
                    Ver Minhas Mensagens
                  </Link>
                </Button>
              </Card>
            )}

            {/* Recent Badges */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Conquistas Recentes</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Ainda não há conquistas.</p>
                <p className="text-xs text-muted-foreground mt-1">Complete devocionais para ganhar medalhas!</p>
              </div>
            </Card>
          </div>

          {/* Seção de Desafios */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Desafios Disponíveis</h2>
                <p className="text-muted-foreground">
                  Complete desafios e ganhe recompensas!
                </p>
              </div>
            </div>
            <ChallengesList />
          </div>
        </div>
      </main>
      
      {/* Mentor Virtual Chat */}
      {showMentorChat && (
        <GeneralMentorChat onClose={() => setShowMentorChat(false)} />
      )}

      {/* Notificações em tempo real para pastores */}
      <PastorNotifications />
    </div>
  );
};

export default Dashboard;
