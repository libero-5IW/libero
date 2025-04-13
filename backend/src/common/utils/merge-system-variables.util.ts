interface SystemVariable {
  id?: string;
  variableName: string;
  label: string;
  type: string;
  required: boolean;
}

interface TemplateWithVariables {
  id: string;
  name: string;
  contentHtml: string;
  userId: string;
  variables: SystemVariable[];
}

export function mergeSystemVariables<T extends TemplateWithVariables>(
  template: T,
  systemVariables: SystemVariable[],
): T {
  const systemWithTemplateId = systemVariables.map((v) => ({
    ...v,
    templateId: template.id,
  }));

  return {
    ...template,
    variables: [...template.variables, ...systemWithTemplateId],
  };
}
