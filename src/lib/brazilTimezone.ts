/**
 * Brazil Timezone Utilities
 * Brazil uses UTC-3 (America/Sao_Paulo) without daylight saving time since 2019
 */

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Gets the current date in Brazil timezone as YYYY-MM-DD string
 */
export const getBrazilDateString = (): string => {
  const now = new Date();
  const brazilDate = new Date(now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  const year = brazilDate.getFullYear();
  const month = String(brazilDate.getMonth() + 1).padStart(2, '0');
  const day = String(brazilDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current Date object adjusted to Brazil timezone
 */
export const getBrazilDate = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Gets an ISO string for the current time in Brazil
 */
export const getBrazilISOString = (): string => {
  return new Date().toISOString();
};

/**
 * Formats a date string to Brazil locale
 */
export const formatBrazilDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('pt-BR', options);
};

/**
 * Gets start and end of current week in Brazil timezone
 */
export const getBrazilWeekBounds = (): { startOfWeek: Date; endOfWeek: Date } => {
  const today = getBrazilDate();
  const dayOfWeek = today.getDay();
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

export { BRAZIL_TIMEZONE };
