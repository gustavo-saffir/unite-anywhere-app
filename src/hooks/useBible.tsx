import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'https://www.abibliadigital.com.br/api';

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

interface SearchResult {
  occurrence: number;
  version: string;
  verses: Array<{
    book: {
      abbrev: string;
      name: string;
    };
    chapter: number;
    number: number;
    text: string;
  }>;
}

export const useBibleChapter = (bookAbbrev: string, chapterNumber: number) => {
  return useQuery({
    queryKey: ['bible', 'chapter', bookAbbrev, chapterNumber],
    queryFn: async (): Promise<Chapter> => {
      const response = await fetch(`${API_BASE_URL}/verses/nvi/${bookAbbrev}/${chapterNumber}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar capítulo');
      }
      return response.json();
    },
    enabled: !!bookAbbrev && chapterNumber > 0,
    staleTime: 1000 * 60 * 60, // 1 hora - cache agressivo
  });
};

export const useBibleSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['bible', 'search', searchTerm],
    queryFn: async (): Promise<SearchResult> => {
      const response = await fetch(`${API_BASE_URL}/verses/nvi/search/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Falha na busca');
      }
      return response.json();
    },
    enabled: searchTerm.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
