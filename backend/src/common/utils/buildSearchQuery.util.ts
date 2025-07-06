export function buildSearchQuery(
    rawSearch: string,
    userId: string,
    entityLabel: string,
  ) {
    const raw = rawSearch.trim().toLowerCase();
  
    const searchNumber = Number(raw);
    const isNumberSearch = !isNaN(searchNumber) && raw !== '';
  
    const regex = new RegExp(`${entityLabel}\\s*#?(\\d+)`, 'i');
    const matchEntityNumber = raw.match(regex);
    const extractedNumber = matchEntityNumber ? Number(matchEntityNumber[1]) : null;
  
    const isKeyword = raw.startsWith(entityLabel[0]);
    const isTitleSearch = entityLabel.startsWith(raw) && raw.length >= 1;
  
    const hasValidQuery =
      isKeyword || isNumberSearch || extractedNumber !== null || raw.length >= 2;
  
    const baseWhere: any = {
      userId,
    };
  
    if (isTitleSearch) {
      return baseWhere;
    }
  
    if (hasValidQuery) {
      baseWhere.OR = [
        ...(isNumberSearch
          ? [{ number: { equals: searchNumber } }]
          : []),
        ...(extractedNumber !== null
          ? [{ number: { equals: extractedNumber } }]
          : []),
        {
          client: {
            OR: [
              { firstName: { contains: raw, mode: 'insensitive' } },
              { lastName: { contains: raw, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }
  
    return baseWhere;
  }
  