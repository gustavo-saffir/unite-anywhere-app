import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bibleBooks } from "@/data/bibleBooks";

interface ChapterSelectorProps {
  currentBookAbbrev: string;
  currentChapter: number;
  onBookChange: (bookAbbrev: string) => void;
  onChapterChange: (chapter: number) => void;
}

export const ChapterSelector = ({
  currentBookAbbrev,
  currentChapter,
  onBookChange,
  onChapterChange,
}: ChapterSelectorProps) => {
  const currentBook = bibleBooks.find(b => b.abbrev === currentBookAbbrev);
  
  return (
    <div className="flex gap-3 items-center">
      <Select value={currentBookAbbrev} onValueChange={onBookChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {bibleBooks.map((book) => (
            <SelectItem key={book.abbrev} value={book.abbrev}>
              {book.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentChapter.toString()}
        onValueChange={(value) => onChapterChange(parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {currentBook &&
            Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(
              (chapterNum) => (
                <SelectItem key={chapterNum} value={chapterNum.toString()}>
                  Capítulo {chapterNum}
                </SelectItem>
              )
            )}
        </SelectContent>
      </Select>
    </div>
  );
};
