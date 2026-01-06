import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AudioPlayerProps {
  text: string;
  className?: string;
  isDarkMode?: boolean;
}

const AudioPlayer = ({ text, className, isDarkMode }: AudioPlayerProps) => {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    rate,
    setRate,
  } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
  };

  const rates = [
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
  ];

  return (
    <div className={cn(
      'flex items-center gap-1.5 sm:gap-2',
      className
    )}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlayPause}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          isSpeaking && !isPaused && 'bg-primary text-primary-foreground hover:bg-primary/90',
          isDarkMode && 'border-gray-600 hover:bg-gray-700'
        )}
        title={isSpeaking && !isPaused ? 'Pausar' : 'Ouvir'}
      >
        {isSpeaking && !isPaused ? (
          <Pause className="w-4 h-4" />
        ) : isPaused ? (
          <Play className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      {isSpeaking && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            className={cn(
              'h-8 w-8 p-0 rounded-full',
              isDarkMode && 'border-gray-600 hover:bg-gray-700'
            )}
            title="Parar"
          >
            <Square className="w-3.5 h-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 px-2 text-xs font-medium',
                  isDarkMode && 'border-gray-600 hover:bg-gray-700'
                )}
              >
                {rate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {rates.map((r) => (
                <DropdownMenuItem
                  key={r.value}
                  onClick={() => setRate(r.value)}
                  className={cn(
                    'text-sm',
                    rate === r.value && 'bg-primary/10 font-medium'
                  )}
                >
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {isSpeaking && !isPaused && (
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
          <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
