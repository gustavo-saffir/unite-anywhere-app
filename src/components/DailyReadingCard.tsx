import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDailyReading } from '@/hooks/useDailyReading';

export const DailyReadingCard = () => {
  const { dailyReadings, loading, hasCompleted } = useDailyReading();

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

  if (!dailyReadings || dailyReadings.length === 0) {
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

  const firstReading = dailyReadings[0];
  const uniqueBooks = [...new Set(dailyReadings.map(r => r.book))];

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
              {uniqueBooks.join(' e ')} - {dailyReadings.length} {dailyReadings.length === 1 ? 'Capítulo' : 'Capítulos'}
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
        <div className="space-y-2 mb-4">
          {dailyReadings.slice(0, 2).map((reading) => (
            <p key={reading.id} className="text-sm text-muted-foreground line-clamp-1">
              Cap. {reading.chapter}: {reading.chapter_text.substring(0, 80)}...
            </p>
          ))}
          {dailyReadings.length > 2 && (
            <p className="text-xs text-muted-foreground">
              + {dailyReadings.length - 2} {dailyReadings.length - 2 === 1 ? 'capítulo' : 'capítulos'}
            </p>
          )}
        </div>
        
        <Link to="/daily-reading">
          <Button className="w-full" variant={hasCompleted ? "outline" : "default"}>
            {hasCompleted ? 'Reler capítulos' : 'Ler agora'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};