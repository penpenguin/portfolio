const formatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
};

export const formatDate = (date: Date, locale = 'ja-JP'): string =>
  new Intl.DateTimeFormat(locale, formatOptions).format(date);
