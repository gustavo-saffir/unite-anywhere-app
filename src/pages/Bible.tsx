import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BibleSidebar } from "@/components/bible/BibleSidebar";
import { ChapterSelector } from "@/components/bible/ChapterSelector";
import { VerseDisplay } from "@/components/bible/VerseDisplay";
import { SearchDialog } from "@/components/bible/SearchDialog";
import { useBibleNavigation } from "@/hooks/useBibleNavigation";
import { useBibleChapter } from "@/hooks/useBible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Bible = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    currentBookAbbrev,
    currentChapter,
    currentBook,
    goToChapter,
    nextChapter,
    previousChapter,
  } = useBibleNavigation();

  const { data: chapterData, isLoading, error } = useBibleChapter(
    currentBookAbbrev,
    currentChapter
  );

  const handleBookSelect = (bookAbbrev: string) => {
    goToChapter(bookAbbrev, 1);
    setSidebarOpen(false);
  };

  const isFirstChapter = currentBookAbbrev === 'gn' && currentChapter === 1;
  const isLastChapter = currentBookAbbrev === 'ap' && currentChapter === 22;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <BibleSidebar
          currentBookAbbrev={currentBookAbbrev}
          onBookSelect={handleBookSelect}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <BibleSidebar
            currentBookAbbrev={currentBookAbbrev}
            onBookSelect={handleBookSelect}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
                      <BookOpen className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Dashboard
                </Button>
              </div>

              <SearchDialog onVerseSelect={goToChapter} />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <ChapterSelector
                currentBookAbbrev={currentBookAbbrev}
                currentChapter={currentChapter}
                onBookChange={(abbrev) => goToChapter(abbrev, 1)}
                onChapterChange={(chapter) => goToChapter(currentBookAbbrev, chapter)}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousChapter}
                  disabled={isFirstChapter}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextChapter}
                  disabled={isLastChapter}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Card className="p-8 text-center">
                <p className="text-destructive">
                  Erro ao carregar o capítulo. Por favor, tente novamente.
                </p>
              </Card>
            )}

            {chapterData && (
              <div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {currentBook?.name} {currentChapter}
                  </h1>
                  <p className="text-muted-foreground">
                    {currentBook?.testament === 'VT' ? 'Antigo Testamento' : 'Novo Testamento'} • {currentBook?.group}
                  </p>
                </div>

                <Card className="p-6">
                  <VerseDisplay
                    verses={chapterData.verses}
                    bookName={currentBook?.name || ''}
                    chapterNumber={currentChapter}
                  />
                </Card>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={previousChapter}
                    disabled={isFirstChapter}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Capítulo Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextChapter}
                    disabled={isLastChapter}
                  >
                    Próximo Capítulo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bible;
