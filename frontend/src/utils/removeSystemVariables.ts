export function removeSystemVariables<T extends { variables?: { templateId?: string }[] }>(template: T): T {
    if (!template.variables) return template;

    return {
      ...template,
      variables: template.variables.filter((v) =>  v.templateId !== 'defaultTemplate'),
    };
  }
  