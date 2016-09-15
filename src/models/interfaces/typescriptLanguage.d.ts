/** Interface base for typescript entry */
export interface ITypescriptEntry {
    documentation?: string;
    name?: string;
}

/** Interface for typescript simbol entry */
export interface ITypescriptSimbolEntry extends ITypescriptEntry {
    type?: string;
}

/** Interface for typescript signature entry (call, constructor, property) */
export interface ITypescriptSignatureEntry extends ITypescriptEntry {
    parameters?: ITypescriptSimbolEntry[];
    returnType?: string;
}

/** Interface with typescript document entry */
export interface ITypescriptClassEntry extends ITypescriptSimbolEntry {
    constructors?: ITypescriptSignatureEntry[];
    methods?: ITypescriptSignatureEntry[];
    properties?: ITypescriptSignatureEntry[];
}




