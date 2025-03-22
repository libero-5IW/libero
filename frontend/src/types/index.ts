export type ToastStatus = 'success' | 'error' | 'info' | 'warning';

export interface Header {
    title: string;
    value: string;
    sortable: boolean;
    transform?: (value: any) => string;
}