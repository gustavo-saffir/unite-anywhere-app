import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RankingUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_quizzes: number;
  total_score: number;
  perfect_scores: number;
  avg_score: number;
}

export default function WeeklyQuizRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from('weekly_quiz_ranking')
          .select('*');

        if (error) throw error;
        setRanking((data as RankingUser[]) || []);
      } catch (err) {
        console.error('Error fetching ranking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position + 1}</span>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 1:
        return 'bg-gray-500/10 border-gray-400/30';
      case 2:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'bg-muted/50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhum quiz completado esta semana</p>
            <p className="text-sm mt-1">Seja o primeiro!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Ranking Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ranking.map((user, index) => (
          <div
            key={user.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              getPositionStyle(index),
              user.user_id === currentUserId && "ring-2 ring-primary"
            )}
          >
            <div className="flex-shrink-0">
              {getPositionIcon(index)}
            </div>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium truncate text-sm",
                user.user_id === currentUserId && "text-primary"
              )}>
                {user.full_name}
                {user.user_id === currentUserId && ' (você)'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.total_quizzes} quiz{user.total_quizzes !== 1 ? 'zes' : ''} • {user.perfect_scores} perfeito{user.perfect_scores !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg">{user.total_score}</p>
              <p className="text-xs text-muted-foreground">pontos</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
