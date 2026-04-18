import { format } from 'date-fns';

export const formatDatePretty = (date = new Date()) => format(date, 'EEEE, MMM d');
export const kCal = (n = 0) => `${Math.round(n)} kcal`;
export const grams = (n = 0) => `${Math.round(n)}g`;
