import { JSDOM } from 'jsdom';

export function extractVariablesFromHtml(html: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const spans = document.querySelectorAll('span[data-type="variable"][data-variable-name]');
  return Array.from(spans)
    .map(span => (span as HTMLSpanElement).getAttribute('data-variable-name'))
    .filter((name): name is string => !!name);
}