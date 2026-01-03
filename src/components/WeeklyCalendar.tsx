import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getBrazilDate, getBrazilWeekBounds } from "@/lib/brazilTimezone";

const WeeklyCalendar = () => {
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;

    const loadWeeklyProgress = async () => {
      const { startOfWeek, endOfWeek } = getBrazilWeekBounds();

      try {
        const { data, error } = await supabase
          .from('user_devotionals')
          .select('completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', startOfWeek.toISOString())
          .lte('completed_at', endOfWeek.toISOString());

        if (error) throw error;

        if (data) {
          const completed = new Set<number>();
          data.forEach((devotional) => {
            const completedDate = new Date(devotional.completed_at);
            const dayIndex = completedDate.getDay();
            completed.add(dayIndex);
          });
          setCompletedDays(completed);
        }
      } catch (error) {
        console.error('Error loading weekly progress:', error);
      }
    };

    loadWeeklyProgress();
  }, [user]);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = getBrazilDate().getDay();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">Semana Atual</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isCompleted = completedDays.has(i);
          const isToday = i === today;
          
          return (
            <div key={i} className="text-center">
              <div className={`text-xs mb-2 ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {day}
              </div>
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-gradient-celestial shadow-glow' 
                    : isToday 
                    ? 'bg-muted border-2 border-primary' 
                    : 'bg-muted'
                }`}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WeeklyCalendar;
