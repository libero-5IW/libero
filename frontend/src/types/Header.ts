export interface Header {
    title: string;
    value: string;
    sortable: boolean;
    transform?: (value: any) => string;
}