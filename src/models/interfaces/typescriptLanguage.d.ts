
/** Interface with typescript document entry */
export interface ITypescriptDocumentEntry {
    constructors?: ITypescriptDocumentEntry[];
    documentation?: string;
    fileName?: string;
    name?: string;
    parameters?: ITypescriptDocumentEntry[];
    returnType?: string;
    type?: string;
}
