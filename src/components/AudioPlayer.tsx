import { Volume2, Pause, Play, Square, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
    voices,
    selectedVoice,
    setSelectedVoice,
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

  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  // Prioritize Portuguese voices
  const sortedLanguages = Object.keys(groupedVoices).sort((a, b) => {
    if (a === 'pt') return -1;
    if (b === 'pt') return 1;
    return a.localeCompare(b);
  });

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      'pt': 'Português',
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
    };
    return names[code] || code.toUpperCase();
  };

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
            <DropdownMenuContent align="end" className="min-w-[80px] bg-popover z-50">
              {rates.map((r) => (
                <DropdownMenuItem
                  key={r.value}
                  onClick={() => setRate(r.value)}
                  className={cn(
                    'text-sm cursor-pointer',
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

      {/* Voice Selector - Always visible */}
      {voices.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 rounded-full',
                isDarkMode && 'border-gray-600 hover:bg-gray-700'
              )}
              title="Selecionar voz"
            >
              <Mic className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="max-h-[300px] overflow-y-auto min-w-[200px] bg-popover z-50"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Selecionar Voz
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortedLanguages.map((lang) => (
              <div key={lang}>
                <DropdownMenuLabel className="text-xs font-medium text-primary py-1">
                  {getLanguageName(lang)}
                </DropdownMenuLabel>
                {groupedVoices[lang].map((voice) => (
                  <DropdownMenuItem
                    key={voice.voiceURI}
                    onClick={() => setSelectedVoice(voice)}
                    className={cn(
                      'text-sm cursor-pointer pl-4',
                      selectedVoice?.voiceURI === voice.voiceURI && 'bg-primary/10 font-medium'
                    )}
                  >
                    <span className="truncate max-w-[150px]">
                      {voice.name.replace(/Microsoft|Google|Apple/gi, '').trim()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
