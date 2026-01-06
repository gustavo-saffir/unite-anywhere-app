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

  // Filter voices to only show pt-BR, en-US, es-ES
  const allowedLocales = ['pt-BR', 'en-US', 'es-ES'];
  const filteredVoices = voices.filter((voice) => 
    allowedLocales.some((locale) => voice.lang === locale || voice.lang.startsWith(locale.split('-')[0]))
  );

  // Group voices by locale
  const groupedVoices = filteredVoices.reduce((acc, voice) => {
    // Determine the group based on exact locale match
    let group = 'other';
    if (voice.lang === 'pt-BR' || voice.lang.startsWith('pt')) group = 'pt-BR';
    else if (voice.lang === 'en-US' || voice.lang === 'en') group = 'en-US';
    else if (voice.lang === 'es-ES' || voice.lang === 'es') group = 'es-ES';
    
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  // Define order: Portuguese first, then English, then Spanish
  const languageOrder = ['pt-BR', 'en-US', 'es-ES'];
  const sortedLanguages = languageOrder.filter((lang) => groupedVoices[lang]?.length > 0);

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (USA)',
      'es-ES': 'Español (España)',
    };
    return names[code] || code;
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
      {filteredVoices.length > 1 && (
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
