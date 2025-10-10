import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  number: number;
  text: string;
}

interface VerseDisplayProps {
  verses: Verse[];
  bookName: string;
  chapterNumber: number;
}

export const VerseDisplay = ({ verses, bookName, chapterNumber }: VerseDisplayProps) => {
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const { toast } = useToast();

  const copyVerse = (verse: Verse) => {
    const text = `${bookName} ${chapterNumber}:${verse.number} - ${verse.text}`;
    navigator.clipboard.writeText(text);
    setCopiedVerse(verse.number);
    toast({
      title: "Versículo copiado!",
      description: "O versículo foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <div
          key={verse.number}
          className="group flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="flex-shrink-0 text-sm font-semibold text-primary mt-1">
            {verse.number}
          </span>
          <p className="flex-1 text-foreground leading-relaxed font-serif text-lg">
            {verse.text}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyVerse(verse)}
          >
            {copiedVerse === verse.number ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};
