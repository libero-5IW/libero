import type { VariableValue } from '@/types';

export function generateFinalHtml(template: string, variables: VariableValue[]): string {
  const signatureVariables = [
        'freelancer_signature',
        'freelancer_fullname_signed', 
        'freelancer_date_signed', 
        'client_signature', 
        'client_date_signed', 
        'client_fullname_signed'
  ];

  return variables.reduce((html, variable) => {
    if (signatureVariables.includes(variable.variableName) && !variable.value) {
      return html;
    }
    const regex = new RegExp(`{{\\s*${variable.variableName}\\s*}}`, 'g');
    return html.replace(regex, variable.value || '');
  }, template);
}