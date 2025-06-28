export function extractUsedVariableNames(content: string): string[] {
    const matches = content.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g) || [];
    return matches.map(m => m.replace(/[{}]/g, '').trim());
  }
  