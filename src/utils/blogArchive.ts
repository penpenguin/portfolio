export const createBlogArchive = (months: string[], currentMonth?: string) => {
  if (months.length === 0) return null;

  const publishedMonths = new Set(months);
  const years = [...new Set(months.map((month) => month.split('/')[0]))]
    .sort()
    .reverse();
  const currentYear = currentMonth?.split('/')[0];

  return {
    selectedYear:
      currentYear && years.includes(currentYear) ? currentYear : years[0],
    totalMonths: publishedMonths.size,
    years: years.map((year) => ({
      year,
      months: Array.from({ length: 12 }, (_, index) => {
        const key = `${year}/${String(index + 1).padStart(2, '0')}`;
        const hasPosts = publishedMonths.has(key);

        return {
          key,
          label: `${index + 1}月`,
          hasPosts,
          isCurrent: hasPosts && key === currentMonth,
        };
      }),
    })),
  };
};
