export interface BibleBook {
  abbrev: string;
  name: string;
  testament: 'VT' | 'NT';
  group: string;
  chapters: number;
}

export const bibleBooks: BibleBook[] = [
  // Pentateuco
  { abbrev: 'gn', name: 'Gênesis', testament: 'VT', group: 'Pentateuco', chapters: 50 },
  { abbrev: 'ex', name: 'Êxodo', testament: 'VT', group: 'Pentateuco', chapters: 40 },
  { abbrev: 'lv', name: 'Levítico', testament: 'VT', group: 'Pentateuco', chapters: 27 },
  { abbrev: 'nm', name: 'Números', testament: 'VT', group: 'Pentateuco', chapters: 36 },
  { abbrev: 'dt', name: 'Deuteronômio', testament: 'VT', group: 'Pentateuco', chapters: 34 },
  
  // Históricos
  { abbrev: 'js', name: 'Josué', testament: 'VT', group: 'Históricos', chapters: 24 },
  { abbrev: 'jz', name: 'Juízes', testament: 'VT', group: 'Históricos', chapters: 21 },
  { abbrev: 'rt', name: 'Rute', testament: 'VT', group: 'Históricos', chapters: 4 },
  { abbrev: '1sm', name: '1 Samuel', testament: 'VT', group: 'Históricos', chapters: 31 },
  { abbrev: '2sm', name: '2 Samuel', testament: 'VT', group: 'Históricos', chapters: 24 },
  { abbrev: '1rs', name: '1 Reis', testament: 'VT', group: 'Históricos', chapters: 22 },
  { abbrev: '2rs', name: '2 Reis', testament: 'VT', group: 'Históricos', chapters: 25 },
  { abbrev: '1cr', name: '1 Crônicas', testament: 'VT', group: 'Históricos', chapters: 29 },
  { abbrev: '2cr', name: '2 Crônicas', testament: 'VT', group: 'Históricos', chapters: 36 },
  { abbrev: 'ed', name: 'Esdras', testament: 'VT', group: 'Históricos', chapters: 10 },
  { abbrev: 'ne', name: 'Neemias', testament: 'VT', group: 'Históricos', chapters: 13 },
  { abbrev: 'et', name: 'Ester', testament: 'VT', group: 'Históricos', chapters: 10 },
  
  // Poéticos
  { abbrev: 'job', name: 'Jó', testament: 'VT', group: 'Poéticos', chapters: 42 },
  { abbrev: 'sl', name: 'Salmos', testament: 'VT', group: 'Poéticos', chapters: 150 },
  { abbrev: 'pv', name: 'Provérbios', testament: 'VT', group: 'Poéticos', chapters: 31 },
  { abbrev: 'ec', name: 'Eclesiastes', testament: 'VT', group: 'Poéticos', chapters: 12 },
  { abbrev: 'ct', name: 'Cânticos', testament: 'VT', group: 'Poéticos', chapters: 8 },
  
  // Profetas Maiores
  { abbrev: 'is', name: 'Isaías', testament: 'VT', group: 'Profetas Maiores', chapters: 66 },
  { abbrev: 'jr', name: 'Jeremias', testament: 'VT', group: 'Profetas Maiores', chapters: 52 },
  { abbrev: 'lm', name: 'Lamentações', testament: 'VT', group: 'Profetas Maiores', chapters: 5 },
  { abbrev: 'ez', name: 'Ezequiel', testament: 'VT', group: 'Profetas Maiores', chapters: 48 },
  { abbrev: 'dn', name: 'Daniel', testament: 'VT', group: 'Profetas Maiores', chapters: 12 },
  
  // Profetas Menores
  { abbrev: 'os', name: 'Oséias', testament: 'VT', group: 'Profetas Menores', chapters: 14 },
  { abbrev: 'jl', name: 'Joel', testament: 'VT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'am', name: 'Amós', testament: 'VT', group: 'Profetas Menores', chapters: 9 },
  { abbrev: 'ob', name: 'Obadias', testament: 'VT', group: 'Profetas Menores', chapters: 1 },
  { abbrev: 'jn', name: 'Jonas', testament: 'VT', group: 'Profetas Menores', chapters: 4 },
  { abbrev: 'mq', name: 'Miquéias', testament: 'VT', group: 'Profetas Menores', chapters: 7 },
  { abbrev: 'na', name: 'Naum', testament: 'VT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'hc', name: 'Habacuque', testament: 'VT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'sf', name: 'Sofonias', testament: 'VT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'ag', name: 'Ageu', testament: 'VT', group: 'Profetas Menores', chapters: 2 },
  { abbrev: 'zc', name: 'Zacarias', testament: 'VT', group: 'Profetas Menores', chapters: 14 },
  { abbrev: 'ml', name: 'Malaquias', testament: 'VT', group: 'Profetas Menores', chapters: 4 },
  
  // Evangelhos
  { abbrev: 'mt', name: 'Mateus', testament: 'NT', group: 'Evangelhos', chapters: 28 },
  { abbrev: 'mc', name: 'Marcos', testament: 'NT', group: 'Evangelhos', chapters: 16 },
  { abbrev: 'lc', name: 'Lucas', testament: 'NT', group: 'Evangelhos', chapters: 24 },
  { abbrev: 'jo', name: 'João', testament: 'NT', group: 'Evangelhos', chapters: 21 },
  
  // Histórico do NT
  { abbrev: 'at', name: 'Atos', testament: 'NT', group: 'Histórico', chapters: 28 },
  
  // Cartas de Paulo
  { abbrev: 'rm', name: 'Romanos', testament: 'NT', group: 'Cartas de Paulo', chapters: 16 },
  { abbrev: '1co', name: '1 Coríntios', testament: 'NT', group: 'Cartas de Paulo', chapters: 16 },
  { abbrev: '2co', name: '2 Coríntios', testament: 'NT', group: 'Cartas de Paulo', chapters: 13 },
  { abbrev: 'gl', name: 'Gálatas', testament: 'NT', group: 'Cartas de Paulo', chapters: 6 },
  { abbrev: 'ef', name: 'Efésios', testament: 'NT', group: 'Cartas de Paulo', chapters: 6 },
  { abbrev: 'fp', name: 'Filipenses', testament: 'NT', group: 'Cartas de Paulo', chapters: 4 },
  { abbrev: 'cl', name: 'Colossenses', testament: 'NT', group: 'Cartas de Paulo', chapters: 4 },
  { abbrev: '1ts', name: '1 Tessalonicenses', testament: 'NT', group: 'Cartas de Paulo', chapters: 5 },
  { abbrev: '2ts', name: '2 Tessalonicenses', testament: 'NT', group: 'Cartas de Paulo', chapters: 3 },
  { abbrev: '1tm', name: '1 Timóteo', testament: 'NT', group: 'Cartas de Paulo', chapters: 6 },
  { abbrev: '2tm', name: '2 Timóteo', testament: 'NT', group: 'Cartas de Paulo', chapters: 4 },
  { abbrev: 'tt', name: 'Tito', testament: 'NT', group: 'Cartas de Paulo', chapters: 3 },
  { abbrev: 'fm', name: 'Filemom', testament: 'NT', group: 'Cartas de Paulo', chapters: 1 },
  
  // Cartas Gerais
  { abbrev: 'hb', name: 'Hebreus', testament: 'NT', group: 'Cartas Gerais', chapters: 13 },
  { abbrev: 'tg', name: 'Tiago', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '1pe', name: '1 Pedro', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '2pe', name: '2 Pedro', testament: 'NT', group: 'Cartas Gerais', chapters: 3 },
  { abbrev: '1jo', name: '1 João', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '2jo', name: '2 João', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  { abbrev: '3jo', name: '3 João', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  { abbrev: 'jd', name: 'Judas', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  
  // Apocalipse
  { abbrev: 'ap', name: 'Apocalipse', testament: 'NT', group: 'Profético', chapters: 22 },
];

export const getBookByAbbrev = (abbrev: string): BibleBook | undefined => {
  return bibleBooks.find(book => book.abbrev === abbrev);
};

export const getBooksByTestament = (testament: 'VT' | 'NT'): BibleBook[] => {
  return bibleBooks.filter(book => book.testament === testament);
};

export const getBooksByGroup = (group: string): BibleBook[] => {
  return bibleBooks.filter(book => book.group === group);
};

export const allGroups = [...new Set(bibleBooks.map(book => book.group))];
