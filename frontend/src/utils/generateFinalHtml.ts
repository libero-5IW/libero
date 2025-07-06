import type { VariableValue } from '@/types';

export function generateFinalHtml(template: string, variables: VariableValue[]): string {
  return variables.reduce((html, variable) => {
    const regex = new RegExp(`{{\\s*${variable.variableName}\\s*}}`, 'g');
    return html.replace(regex, variable.value || '');
  }, template);
}
