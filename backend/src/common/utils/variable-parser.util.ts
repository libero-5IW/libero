export function extractVariablesFromHtml(html: string): string[] {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  const matches = new Set<string>();
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}
