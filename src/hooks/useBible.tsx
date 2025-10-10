import { useQuery } from '@tanstack/react-query';
import { bibleBooks } from '@/data/bibleBooks';
import { supabase } from '@/integrations/supabase/client';

interface Verse {
  number: number;
  text: string;
}

interface Chapter {
  book: {
    abbrev: string;
    name: string;
  };
  chapter: {
    number: number;
    verses: number;
  };
  verses: Verse[];
}

export const useBibleChapter = (bookAbbrev: string, chapterNumber: number) => {
  return useQuery({
    queryKey: ['bible', 'chapter', bookAbbrev, chapterNumber],
    queryFn: async (): Promise<Chapter> => {
      const book = bibleBooks.find(b => b.abbrev === bookAbbrev);
      if (!book) throw new Error('Livro não encontrado');

      const { data, error } = await supabase.functions.invoke('bible-proxy', {
        body: { book: bookAbbrev, chapter: chapterNumber },
      });

      if (error) {
        throw new Error(error.message || 'Falha ao carregar capítulo');
      }

      const verses: Verse[] = (data.verses || []).map((v: any) => ({ number: v.number, text: v.text }));

      return {
        book: { abbrev: bookAbbrev, name: book.name },
        chapter: { number: chapterNumber, verses: verses.length },
        verses,
      };
    },
    enabled: !!bookAbbrev && chapterNumber > 0,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
};
