import { useState } from "react";
import { Search, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchDialogProps {
  onVerseSelect: (bookAbbrev: string, chapter: number) => void;
}

export const SearchDialog = ({ onVerseSelect }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Buscar Versículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar na Bíblia</DialogTitle>
        </DialogHeader>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A função de busca estará disponível em breve. Por enquanto, navegue pelos livros e capítulos usando o menu lateral.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};
