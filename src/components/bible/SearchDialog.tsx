import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibleSearch } from "@/hooks/useBible";

interface SearchDialogProps {
  onVerseSelect: (bookAbbrev: string, chapter: number) => void;
}

export const SearchDialog = ({ onVerseSelect }: SearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { data: searchResults, isLoading } = useBibleSearch(debouncedTerm);

  const handleSearch = () => {
    if (searchTerm.length >= 3) {
      setDebouncedTerm(searchTerm);
    }
  };

  const handleVerseClick = (bookAbbrev: string, chapter: number) => {
    onVerseSelect(bookAbbrev, chapter);
    setOpen(false);
    setSearchTerm("");
    setDebouncedTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Buscar Versículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar na Bíblia</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma palavra ou frase (mínimo 3 caracteres)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searchTerm.length < 3}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px] mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {searchResults && searchResults.verses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {searchResults.occurrence} resultado(s) encontrado(s)
              </p>
              {searchResults.verses.map((verse, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVerseClick(verse.book.abbrev, verse.chapter)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <p className="font-semibold text-sm text-primary mb-1">
                    {verse.book.name} {verse.chapter}:{verse.number}
                  </p>
                  <p className="text-sm text-foreground">{verse.text}</p>
                </button>
              ))}
            </div>
          )}

          {searchResults && searchResults.verses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum versículo encontrado.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
