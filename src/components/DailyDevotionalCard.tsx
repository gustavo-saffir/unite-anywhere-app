import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import bibleIcon from '@/assets/bible-icon.jpg';

const DailyDevotionalCard = () => {
  const [devotional, setDevotional] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayDevotional();
  }, []);

  const loadTodayDevotional = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('devotionals')
        .select('verse_reference, verse_text')
        .eq('date', today)
        .maybeSingle();

      setDevotional(data);
    } catch (error) {
      console.error('Error loading devotional:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-celestial border-primary/20 bg-card/90 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-10 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (!devotional) {
    return (
      <Card className="p-6 shadow-celestial border-primary/20 bg-card/90 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <img 
            src={bibleIcon} 
            alt="Devocional" 
            className="w-16 h-16 rounded-xl shadow-glow mx-auto"
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum devocional disponível hoje
            </h3>
            <p className="text-sm text-muted-foreground">
              O devocional de hoje ainda não foi adicionado.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-celestial border-primary/20 bg-card/90 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <img 
          src={bibleIcon} 
          alt="Devocional" 
          className="w-16 h-16 rounded-xl shadow-glow"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent">Devocional de Hoje</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {devotional.verse_reference}
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            "{devotional.verse_text.substring(0, 100)}..."
          </p>
          <Link to="/devotional">
            <Button className="bg-gradient-celestial hover:opacity-90 shadow-celestial">
              <BookOpen className="w-4 h-4 mr-2" />
              Iniciar Devocional
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default DailyDevotionalCard;
