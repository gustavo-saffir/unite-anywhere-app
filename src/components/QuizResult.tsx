import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Trophy, Star, ThumbsUp, BookOpen, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  userAnswers: number[];
  onReturnToReading: () => void;
  xpEarned?: number;
  newBadge?: string | null;
}

export default function QuizResult({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onReturnToReading,
  xpEarned = 0,
  newBadge = null,
}: QuizResultProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getResultMessage = () => {
    if (score === totalQuestions) {
      return {
        icon: Trophy,
        title: "Parabéns! Leitura perfeita! 🎉",
        subtitle: "Você demonstrou excelente compreensão do texto!",
        color: "text-yellow-500",
      };
    } else if (score >= totalQuestions * 0.66) {
      return {
        icon: Star,
        title: "Muito bem! Continue assim! 👏",
        subtitle: "Você está no caminho certo!",
        color: "text-primary",
      };
    } else if (score >= totalQuestions * 0.33) {
      return {
        icon: ThumbsUp,
        title: "Bom início!",
        subtitle: "Que tal reler o texto com mais atenção?",
        color: "text-orange-500",
      };
    } else {
      return {
        icon: BookOpen,
        title: "Continue tentando!",
        subtitle: "Releia o texto e tente novamente amanhã.",
        color: "text-muted-foreground",
      };
    }
  };

  const result = getResultMessage();
  const ResultIcon = result.icon;

  // Calculate XP based on score (10 XP per correct answer)
  const calculatedXP = xpEarned || score * 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Score card */}
      <Card className="border-primary/20 text-center">
        <CardContent className="pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <ResultIcon className={cn("w-16 h-16 mx-auto mb-4", result.color)} />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
          <p className="text-muted-foreground mb-4">{result.subtitle}</p>
          
          <div className="flex items-center justify-center gap-2 text-3xl font-bold">
            <span className={result.color}>{score}</span>
            <span className="text-muted-foreground">/</span>
            <span>{totalQuestions}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{percentage}% de acertos</p>

          {/* XP Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
          >
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">+{calculatedXP} XP</span>
          </motion.div>

          {/* New Badge */}
          {newBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="mt-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  Nova conquista: {newBadge}
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Questions breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Revisão das respostas</h3>
        
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <Card key={index} className={cn(
              "border-l-4",
              isCorrect ? "border-l-green-500" : "border-l-red-500"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{question.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded text-sm",
                        optIndex === question.correctAnswer && "bg-green-500/10 text-green-700 dark:text-green-400",
                        optIndex === userAnswer && optIndex !== question.correctAnswer && "bg-red-500/10 text-red-700 dark:text-red-400"
                      )}
                    >
                      <span className="font-medium">{optionLabels[optIndex]}.</span>
                      <span>{option}</span>
                      {optIndex === question.correctAnswer && (
                        <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                      )}
                      {optIndex === userAnswer && optIndex !== question.correctAnswer && (
                        <XCircle className="w-4 h-4 ml-auto text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Explicação:</span> {question.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Return button */}
      <Button 
        onClick={onReturnToReading} 
        className="w-full"
        size="lg"
      >
        <BookOpen className="w-5 h-5 mr-2" />
        Voltar para Leitura Diária
      </Button>
    </motion.div>
  );
}