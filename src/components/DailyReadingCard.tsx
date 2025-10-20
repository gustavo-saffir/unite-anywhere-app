import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDailyReading } from '@/hooks/useDailyReading';

export const DailyReadingCard = () => {
  const { dailyReading, loading, hasCompleted } = useDailyReading();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!dailyReading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Leitura Diária - A Bíblia em 1 Ano
          </CardTitle>
          <CardDescription>
            Não há leitura disponível para hoje
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Leitura Diária - A Bíblia em 1 Ano
            </CardTitle>
            <CardDescription>
              {dailyReading.book} - Capítulo {dailyReading.chapter}
            </CardDescription>
          </div>
          
          {hasCompleted ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluída
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Pendente
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {dailyReading.chapter_text.substring(0, 150)}...
        </p>
        
        <Link to="/daily-reading">
          <Button className="w-full" variant={hasCompleted ? "outline" : "default"}>
            {hasCompleted ? 'Reler capítulo' : 'Ler agora'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};