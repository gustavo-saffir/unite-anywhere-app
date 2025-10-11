import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDevotionalHistory } from '@/hooks/useDevotionalHistory';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DevotionalHistory = () => {
  const { history, loading } = useDevotionalHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Histórico de Devocionais</h1>
                  <p className="text-sm text-muted-foreground">Sua jornada espiritual</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Histórico de Devocionais</h1>
                  <p className="text-sm text-muted-foreground">Sua jornada espiritual</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Nenhum devocional completado ainda</h2>
            <p className="text-muted-foreground mb-6">
              Complete seu primeiro devocional para começar sua jornada!
            </p>
            <Link to="/dashboard">
              <Button className="bg-gradient-celestial hover:opacity-90">
                Ir para o Dashboard
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Histórico de Devocionais</h1>
                <p className="text-sm text-muted-foreground">{history.length} devocionais completados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Sua Evolução Espiritual
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui você pode revisar suas reflexões e aplicações anteriores. Compare suas respostas 
            ao longo do tempo e veja como sua fé e compreensão evoluíram!
          </p>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {history.map((item) => {
            const devotional = Array.isArray(item.devotional) 
              ? item.devotional[0] 
              : item.devotional;
            
            if (!devotional) return null;

            const completedDate = new Date(item.completed_at).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <AccordionItem key={item.id} value={item.id}>
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/5">
                    <div className="flex items-start gap-4 text-left w-full">
                      <div className="w-12 h-12 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {devotional.verse_reference}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Completado em {completedDate}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-6 space-y-6">
                      {/* Versículo */}
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm italic text-foreground">"{devotional.verse_text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          — {devotional.verse_reference}
                        </p>
                      </div>

                      {/* Reflexão */}
                      {item.reflection && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">
                            Sua Reflexão:
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            "{devotional.reflection_question}"
                          </p>
                          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {item.reflection}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Aplicação */}
                      {item.application && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">
                            Sua Aplicação:
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            "{devotional.application_question}"
                          </p>
                          <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {item.application}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Memorização */}
                      {item.verse_memorization && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">
                            Memorização do Versículo:
                          </h4>
                          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {item.verse_memorization}
                            </p>
                            {item.memorization_validated && (
                              <p className="text-xs text-primary mt-2 font-medium">
                                ✓ Validado
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>
    </div>
  );
};

export default DevotionalHistory;
