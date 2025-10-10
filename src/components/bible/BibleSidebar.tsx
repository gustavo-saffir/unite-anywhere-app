import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { bibleBooks, allGroups } from "@/data/bibleBooks";
import { BookOpen } from "lucide-react";

interface BibleSidebarProps {
  currentBookAbbrev: string;
  onBookSelect: (bookAbbrev: string) => void;
}

export const BibleSidebar = ({
  currentBookAbbrev,
  onBookSelect,
}: BibleSidebarProps) => {
  return (
    <div className="w-64 border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Livros da Bíblia</h2>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4">
          {/* Antigo Testamento */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Antigo Testamento
            </h3>
            {allGroups
              .filter(group => bibleBooks.find(b => b.group === group && b.testament === 'VT'))
              .map(group => (
                <div key={group} className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {group}
                  </h4>
                  <div className="space-y-1">
                    {bibleBooks
                      .filter(book => book.group === group && book.testament === 'VT')
                      .map(book => (
                        <button
                          key={book.abbrev}
                          onClick={() => onBookSelect(book.abbrev)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                            currentBookAbbrev === book.abbrev
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          {book.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Novo Testamento */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Novo Testamento
            </h3>
            {allGroups
              .filter(group => bibleBooks.find(b => b.group === group && b.testament === 'NT'))
              .map(group => (
                <div key={group} className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {group}
                  </h4>
                  <div className="space-y-1">
                    {bibleBooks
                      .filter(book => book.group === group && book.testament === 'NT')
                      .map(book => (
                        <button
                          key={book.abbrev}
                          onClick={() => onBookSelect(book.abbrev)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                            currentBookAbbrev === book.abbrev
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          {book.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
