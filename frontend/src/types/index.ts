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
    type: VariableType
    templateId?: string
    required: boolean
}

export enum VariableType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  URL = 'url',
}

export const VariableTypeValues = Object.values(VariableType) as [string, ...string[]];

export type TemplateBase<V extends VariableBase = VariableBase> = {
    id: string
    name: string
    contentHtml: string
    userId?: string
    variables: V[]
}

export type VariableValue = {
    id?: string,
    variableName: string
    label: string
    type: VariableType
    templateId?: string
    required: boolean
    value: string
}

export interface DocumentCard {
  id: string;
  number: number;
  status: string;
  createdAt: string;
  previewUrl?: string | null;
  pdfUrl?: string| null;
  clientName: string;
}
  
