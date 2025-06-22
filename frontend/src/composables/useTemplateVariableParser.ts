export interface TemplateVariable {
  variableName: string;
  label: string;
}

export function replaceBracketsWithChips(
  html: string,
  variables: TemplateVariable[]
): string {
  return html.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, variableName) => {
    const variable = variables.find(v => v.variableName === variableName);
    if (!variable) return match;

    return `<span data-type="variable" data-variable-name="${variable.variableName}" data-label="${variable.label}">{{${variable.variableName}}}</span>`;
  });
}

export function replaceChipsWithBrackets(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('span[data-type="variable"][data-variable-name]').forEach(span => {
    const variableName = span.getAttribute('data-variable-name');
    if (variableName) {
      const textNode = doc.createTextNode(`{{${variableName}}}`);
      span.replaceWith(textNode);
    }
  });

  return doc.body.innerHTML;
}
