export function buildTemplateSearchQuery(rawSearch: string, userId: string) {
    const raw = rawSearch.trim().toLowerCase();
  
    const whereClause: any = {
      AND: [{ userId }],
    };
  
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
  