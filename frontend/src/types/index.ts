export type ToastStatus = 'success' | 'error' | 'info' | 'warning';

export interface Header {
    title: string;
    value: string;
    sortable: boolean;
    transform?: (value: any) => string;
}

export type VariableBase = {
    id?: string,
    variableName: string
    label: string
    type: 'string' | 'number' | 'date' | 'boolean'
    templateId?: string
    required: boolean
}

export type TemplateBase<V extends VariableBase = VariableBase> = {
    id: string
    name: string
    contentHtml: string
    userId?: string
    variables: V[]
  }
  
