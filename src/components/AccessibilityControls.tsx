import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useAccessibility } from '@/hooks/useAccessibility';
import { Sun, Moon, Type, Settings2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { fontSize, increaseFontSize, decreaseFontSize } = useAccessibility();

  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Controls Panel */}
      <div
        className={cn(
          "bg-card border border-border rounded-xl shadow-lg p-3 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-3">
          {/* Font Size Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-14">Fonte</span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseFontSize}
                disabled={fontSize === 'small'}
                className="h-8 w-8"
                title="Diminuir fonte"
              >
                <Type className="w-3 h-3" />
              </Button>
              <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
                {fontSize === 'small' ? 'P' : fontSize === 'medium' ? 'M' : 'G'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseFontSize}
                disabled={fontSize === 'large'}
                className="h-8 w-8"
                title="Aumentar fonte"
              >
                <Type className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-14">Tema</span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={!isDark ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme('light')}
                className="h-8 gap-1.5"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-xs">Claro</span>
              </Button>
              <Button
                variant={isDark ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme('dark')}
                className="h-8 gap-1.5"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-xs">Escuro</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
        title={isOpen ? "Fechar" : "Acessibilidade"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Settings2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
