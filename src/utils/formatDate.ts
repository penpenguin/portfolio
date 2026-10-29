const formatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo',
};

export const formatDate = (date: Date, locale = 'ja-JP'): string => {
  if (locale !== 'ja-JP') {
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }

  const parts = new Intl.DateTimeFormat(locale, {
    ...formatOptions,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return ['year', 'month', 'day']
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join('.');
};
