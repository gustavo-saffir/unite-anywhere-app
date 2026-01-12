import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  verseReference?: string;
  verseText?: string;
}

interface Quiz {
  id: string;
  daily_reading_id: string;
  questions: QuizQuestion[];
  created_at: string;
}

interface UserAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: number[];
  score: number;
  completed_at: string;
  xpEarned: number;
  newBadge: string | null;
}

export const useQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAttempt, setUserAttempt] = useState<UserAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = useCallback(async (dailyReadingId: string) => {
    setLoading(true);
    setError(null);

    try {
      // First check if quiz exists
      const { data: existingQuiz, error: quizError } = await supabase
        .from('daily_reading_quizzes')
        .select('*')
        .eq('daily_reading_id', dailyReadingId)
        .maybeSingle();

      if (quizError) throw quizError;

      if (existingQuiz) {
        const formattedQuiz: Quiz = {
          id: existingQuiz.id,
          daily_reading_id: existingQuiz.daily_reading_id,
          questions: existingQuiz.questions as unknown as QuizQuestion[],
          created_at: existingQuiz.created_at || '',
        };
        setQuiz(formattedQuiz);

        // Check if user already attempted this quiz
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: attempt } = await supabase
            .from('user_quiz_attempts')
            .select('*')
            .eq('quiz_id', existingQuiz.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (attempt) {
            setUserAttempt({
              id: attempt.id,
              user_id: attempt.user_id,
              quiz_id: attempt.quiz_id,
              answers: attempt.answers as unknown as number[],
              score: attempt.score,
              completed_at: attempt.completed_at || '',
              xpEarned: attempt.score * 10,
              newBadge: null,
            });
          }
        }
      } else {
        setQuiz(null);
      }
    } catch (err: any) {
      console.error('Error loading quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQuiz = useCallback(async (dailyReadingId: string) => {
    setGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-quiz', {
        body: { daily_reading_id: dailyReadingId },
      });

      if (fnError) throw fnError;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.quiz) {
        const formattedQuiz: Quiz = {
          id: data.quiz.id,
          daily_reading_id: data.quiz.daily_reading_id,
          questions: data.quiz.questions as QuizQuestion[],
          created_at: data.quiz.created_at || '',
        };
        setQuiz(formattedQuiz);
      }

      return data.quiz;
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const submitAttempt = useCallback(async (quizId: string, answers: number[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (!quiz) throw new Error('Quiz não carregado');

      // Calculate score
      let score = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          score++;
        }
      });

      // Calculate XP (10 XP per correct answer)
      const xpEarned = score * 10;

      // Check for new badge before insert to compare after
      const { data: badgesBefore } = await supabase
        .from('user_badges')
        .select('badges(name)')
        .eq('user_id', user.id);

      const { data: attempt, error: insertError } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          answers: answers as unknown as Json,
          score,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Check for new badges after insert (trigger may have awarded one)
      let newBadge: string | null = null;
      if (score === quiz.questions.length) {
        const { data: badgesAfter } = await supabase
          .from('user_badges')
          .select('badges(name)')
          .eq('user_id', user.id);

        const beforeNames = new Set(badgesBefore?.map((b: any) => b.badges?.name) || []);
        const afterBadges = badgesAfter || [];
        
        for (const badge of afterBadges) {
          const badgeName = (badge as any).badges?.name;
          if (badgeName && !beforeNames.has(badgeName)) {
            newBadge = badgeName;
            break;
          }
        }
      }

      const formattedAttempt: UserAttempt = {
        id: attempt.id,
        user_id: attempt.user_id,
        quiz_id: attempt.quiz_id,
        answers: attempt.answers as unknown as number[],
        score: attempt.score,
        completed_at: attempt.completed_at || '',
        xpEarned,
        newBadge,
      };

      setUserAttempt(formattedAttempt);
      return formattedAttempt;
    } catch (err: any) {
      console.error('Error submitting attempt:', err);
      setError(err.message);
      throw err;
    }
  }, [quiz]);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setUserAttempt(null);
    setError(null);
  }, []);

  return {
    loading,
    generating,
    quiz,
    userAttempt,
    error,
    loadQuiz,
    generateQuiz,
    submitAttempt,
    resetQuiz,
  };
};

export default useQuiz;