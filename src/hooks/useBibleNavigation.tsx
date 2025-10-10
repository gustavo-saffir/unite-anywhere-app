import { useState, useCallback } from 'react';
import { bibleBooks, getBookByAbbrev } from '@/data/bibleBooks';

export const useBibleNavigation = () => {
  const [currentBookAbbrev, setCurrentBookAbbrev] = useState('gn');
  const [currentChapter, setCurrentChapter] = useState(1);

  const currentBook = getBookByAbbrev(currentBookAbbrev);

  const goToChapter = useCallback((bookAbbrev: string, chapter: number) => {
    setCurrentBookAbbrev(bookAbbrev);
    setCurrentChapter(chapter);
  }, []);

  const nextChapter = useCallback(() => {
    if (!currentBook) return;

    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(prev => prev + 1);
    } else {
      // Move to next book
      const currentIndex = bibleBooks.findIndex(b => b.abbrev === currentBookAbbrev);
      if (currentIndex < bibleBooks.length - 1) {
        const nextBook = bibleBooks[currentIndex + 1];
        setCurrentBookAbbrev(nextBook.abbrev);
        setCurrentChapter(1);
      }
    }
  }, [currentBook, currentBookAbbrev, currentChapter]);

  const previousChapter = useCallback(() => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      // Move to previous book
      const currentIndex = bibleBooks.findIndex(b => b.abbrev === currentBookAbbrev);
      if (currentIndex > 0) {
        const prevBook = bibleBooks[currentIndex - 1];
        setCurrentBookAbbrev(prevBook.abbrev);
        setCurrentChapter(prevBook.chapters);
      }
    }
  }, [currentBookAbbrev, currentChapter]);

  return {
    currentBookAbbrev,
    currentChapter,
    currentBook,
    goToChapter,
    nextChapter,
    previousChapter,
  };
};
