import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  onAnswer: (answerIndex: number) => void;
  disabled?: boolean;
}

export default function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  onAnswer,
  disabled = false,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (disabled || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setTimeout(() => {
      onAnswer(index);
      setSelectedAnswer(null);
    }, 300);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              i < questionNumber
                ? "bg-primary"
                : i === questionNumber
                ? "bg-primary/50"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Pergunta {questionNumber + 1} de {totalQuestions}
      </p>

      {/* Question */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <p className="text-lg font-medium text-center">{question}</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="grid gap-3">
        {options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "h-auto py-4 px-4 text-left justify-start whitespace-normal transition-all",
              selectedAnswer === index && "border-primary bg-primary/10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleSelect(index)}
            disabled={disabled}
          >
            <span className="flex items-start gap-3 w-full">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {optionLabels[index]}
              </span>
              <span className="flex-1">{option}</span>
            </span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}