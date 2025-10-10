import { useQuery } from '@tanstack/react-query';
import { bibleBooks } from '@/data/bibleBooks';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

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

      const url = `${SUPABASE_URL}/functions/v1/bible-proxy?book=${bookAbbrev}&chapter=${chapterNumber}`;
      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
      });

      if (!response.ok) {
        const err = await response.text().catch(() => '');
        throw new Error(err || 'Falha ao carregar capítulo');
      }

      const data = await response.json();
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
