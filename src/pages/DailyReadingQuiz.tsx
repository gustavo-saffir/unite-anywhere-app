import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Brain, Loader2, Sparkles } from 'lucide-react';
import { useDailyReading } from '@/hooks/useDailyReading';
import { useQuiz } from '@/hooks/useQuiz';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResult from '@/components/QuizResult';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

type QuizState = 'loading' | 'start' | 'playing' | 'result';

export default function DailyReadingQuiz() {
  const navigate = useNavigate();
  const { dailyReadings, loading: readingsLoading } = useDailyReading();
  const { 
    loading: quizLoading, 
    generating, 
    quiz, 
    userAttempt, 
    loadQuiz, 
    generateQuiz, 
    submitAttempt 
  } = useQuiz();
  const { trackActivity } = useActivityTracking();

  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedReadingIndex, setSelectedReadingIndex] = useState(0);

  const selectedReading = dailyReadings[selectedReadingIndex];

  useEffect(() => {
    if (!readingsLoading && dailyReadings.length > 0) {
      loadQuiz(dailyReadings[0].id).then(() => {
        setQuizState('start');
      });
    } else if (!readingsLoading && dailyReadings.length === 0) {
      setQuizState('start');
    }
  }, [readingsLoading, dailyReadings, loadQuiz]);

  useEffect(() => {
    if (userAttempt && quiz) {
      setUserAnswers(userAttempt.answers);
      setQuizState('result');
    }
  }, [userAttempt, quiz]);

  const handleStartQuiz = async () => {
    if (!selectedReading) return;

    try {
      if (!quiz) {
        setQuizState('loading');
        await generateQuiz(selectedReading.id);
      }
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizState('playing');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar quiz');
      setQuizState('start');
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < (quiz?.questions.length || 3) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      try {
        const attempt = await submitAttempt(quiz!.id, newAnswers);
        
        // Track activity
        trackActivity('quiz_completed' as any, {
          quiz_id: quiz!.id,
          reading_id: selectedReading?.id,
          score: attempt.score,
          total_questions: quiz!.questions.length,
        });

        setQuizState('result');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao salvar resultado');
      }
    }
  };

  const handleReturnToReading = () => {
    navigate('/daily-reading');
  };

  const handleSelectReading = async (index: number) => {
    setSelectedReadingIndex(index);
    const reading = dailyReadings[index];
    if (reading) {
      setQuizState('loading');
      await loadQuiz(reading.id);
      setQuizState('start');
    }
  };

  // Loading state
  if (readingsLoading || quizState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {generating ? 'Gerando quiz com IA...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  // No readings available
  if (dailyReadings.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/daily-reading')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma leitura disponível</h2>
              <p className="text-muted-foreground">
                Não há leitura diária para hoje. O quiz estará disponível quando houver uma leitura.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/daily-reading')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <Brain className="w-5 h-5" />
            <span className="font-semibold">Quiz Diário</span>
          </div>
        </div>

        {/* Start screen */}
        {quizState === 'start' && (
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quiz da Leitura Diária</CardTitle>
                <CardDescription>
                  Teste seus conhecimentos sobre a leitura de hoje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reading selector */}
                {dailyReadings.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Escolha o capítulo:</p>
                    <div className="flex flex-wrap gap-2">
                      {dailyReadings.map((reading, index) => (
                        <Button
                          key={reading.id}
                          variant={selectedReadingIndex === index ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSelectReading(index)}
                        >
                          {reading.book} {reading.chapter}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedReading?.book} - Capítulo {selectedReading?.chapter}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    3 perguntas de múltipla escolha
                  </p>
                </div>

                {userAttempt ? (
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="font-medium text-primary">
                      Você já completou este quiz!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pontuação: {userAttempt.score}/3
                    </p>
                    <Button 
                      className="mt-3" 
                      variant="outline"
                      onClick={() => setQuizState('result')}
                    >
                      Ver resultado
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>
                        As perguntas são baseadas no texto bíblico. Certifique-se de ter lido o capítulo antes de começar.
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleStartQuiz}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando perguntas...
                        </>
                      ) : quiz ? (
                        'Iniciar Quiz'
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar Quiz com IA
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Playing state */}
        {quizState === 'playing' && quiz && (
          <AnimatePresence mode="wait">
            <QuizQuestion
              key={currentQuestionIndex}
              questionNumber={currentQuestionIndex}
              totalQuestions={quiz.questions.length}
              question={quiz.questions[currentQuestionIndex].question}
              options={quiz.questions[currentQuestionIndex].options}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>
        )}

        {/* Result state */}
        {quizState === 'result' && quiz && userAttempt && (
          <QuizResult
            score={userAttempt.score}
            totalQuestions={quiz.questions.length}
            questions={quiz.questions}
            userAnswers={userAttempt.answers}
            onReturnToReading={handleReturnToReading}
          />
        )}
      </div>
    </div>
  );
}