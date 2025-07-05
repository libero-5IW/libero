export function buildTemplateSearchQuery(
  rawSearch: string,
  userId: string,
  includeDefault = true,
) {
  const raw = rawSearch.trim().toLowerCase();

  const whereClause: any = {
    AND: [],
  };

  if (includeDefault) {
    whereClause.AND.push({
      OR: [{ userId }, { userId: null }],
    });
  } else {
    whereClause.AND.push({ userId });
  }

  if (raw.length >= 2) {
    whereClause.AND.push({
      OR: [
        { name: { contains: raw, mode: 'insensitive' } },
        {
          variables: {
            some: {
              OR: [
                { label: { contains: raw, mode: 'insensitive' } },
                { variableName: { contains: raw, mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    });
  }

  return whereClause;
}
