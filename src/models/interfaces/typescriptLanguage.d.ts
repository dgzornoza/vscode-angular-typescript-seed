/** Interface base for typescript entry */
export interface ITypescriptEntry {
    Documentation?: string;
    Name?: string;
    Kind: number;
    Flag: number;
}

/** Interface for typescript simbol entry */
export interface ITypescriptSimbolEntry extends ITypescriptEntry {
    Type?: string;
}

/** Interface for typescript signature entry (call, constructor, property) */
export interface ITypescriptSignatureEntry extends ITypescriptEntry {
    Parameters?: ITypescriptSimbolEntry[];
    ReturnType?: string;
}

/** Interface with typescript document entry */
export interface ITypescriptClassEntry extends ITypescriptSimbolEntry {
    Constructors?: ITypescriptSignatureEntry[];
    Methods?: ITypescriptSignatureEntry[];
    Properties?: ITypescriptSimbolEntry[];
}




