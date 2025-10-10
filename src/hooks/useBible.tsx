import { useQuery } from '@tanstack/react-query';
import { bibleBooks } from '@/data/bibleBooks';

const API_BASE_URL = 'https://bible-edge.onrender.com';

interface Verse {
  id: number;
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
      // Encontrar o ID do livro
      const book = bibleBooks.find(b => b.abbrev === bookAbbrev);
      if (!book) {
        throw new Error('Livro não encontrado');
      }
      
      // Calcular o bookId baseado na posição (1-indexed)
      const bookId = bibleBooks.findIndex(b => b.abbrev === bookAbbrev) + 1;
      
      const response = await fetch(
        `${API_BASE_URL}/books/${bookId}/chapters/${chapterNumber}/verses`
      );
      
      if (!response.ok) {
        throw new Error('Falha ao carregar capítulo');
      }
      
      const verses = await response.json();
      
      // Transformar para o formato esperado
      return {
        book: {
          abbrev: bookAbbrev,
          name: book.name,
        },
        chapter: {
          number: chapterNumber,
          verses: verses.length,
        },
        verses: verses.map((v: any) => ({
          number: v.verse,
          text: v.text,
        })),
      };
    },
    enabled: !!bookAbbrev && chapterNumber > 0,
    staleTime: 1000 * 60 * 60, // 1 hora - cache agressivo
    retry: 2,
  });
};
