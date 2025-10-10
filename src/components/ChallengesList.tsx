import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Calendar, Award, Target } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  reward_type: string;
  reward_value: string;
  category: string;
}

interface UserChallenge {
  challenge_id: string;
  progress: number;
  status: string;
  started_at: string;
}

const ChallengesList = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Record<string, UserChallenge>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar desafios
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Carregar progresso do usuário
      const { data: userChallengesData, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);

      if (userChallengesError) throw userChallengesError;

      setChallenges(challengesData || []);
      
      // Criar mapa de desafios do usuário
      const challengesMap: Record<string, UserChallenge> = {};
      userChallengesData?.forEach(uc => {
        challengesMap[uc.challenge_id] = uc;
      });
      setUserChallenges(challengesMap);
    } catch (error: any) {
      console.error('Error loading challenges:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os desafios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          status: 'in_progress',
          progress: 0,
        });

      if (error) throw error;

      toast({
        title: 'Desafio Iniciado!',
        description: 'Você começou um novo desafio. Boa sorte!',
      });

      loadChallenges();
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível iniciar o desafio.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando desafios...</p>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-2">
          <Target className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Ainda não há desafios disponíveis.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const userChallenge = userChallenges[challenge.id];
        const isCompleted = userChallenge?.status === 'completed';
        const isInProgress = userChallenge?.status === 'in_progress';

        return (
          <Card key={challenge.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {challenge.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {challenge.duration_days} dias
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {challenge.reward_type === 'medalha' ? (
                      <>
                        <Award className="w-3 h-3" />
                        {challenge.reward_value}
                      </>
                    ) : (
                      <>
                        <Trophy className="w-3 h-3" />
                        +{challenge.reward_value} XP
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isCompleted ? (
                  <Badge className="bg-green-500">
                    ✓ Concluído
                  </Badge>
                ) : isInProgress ? (
                  <Badge className="bg-blue-500">
                    Em Andamento
                  </Badge>
                ) : (
                  <Button
                    onClick={() => startChallenge(challenge.id)}
                    size="sm"
                    className="bg-gradient-celestial hover:opacity-90"
                  >
                    Iniciar
                  </Button>
                )}
              </div>
            </div>

            {isInProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{userChallenge.progress}%</span>
                </div>
                <Progress value={userChallenge.progress} className="h-2" />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ChallengesList;
