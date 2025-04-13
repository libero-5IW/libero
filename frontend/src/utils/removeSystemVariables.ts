

export function removeSystemVariables<T extends { variables?: { id?: string }[] }>(template: T): T {
    if (!template.variables) return template;

    return {
      ...template,
      variables: template.variables.filter((v) => !v.id || v.id !== 'systemVariable'),
    };
  }
  