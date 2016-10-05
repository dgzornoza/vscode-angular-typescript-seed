/** Interface base for typescript entry */
export interface ITypescriptEntry {
    Documentation?: string;
    Name?: string;
    Kind: number;
    Flag: number;
}

/** Interface for typescript simbol entry (parameters, properties)*/
export interface ITypescriptSimbolEntry extends ITypescriptEntry {
    Type?: string;
}

/** Interface for typescript signature entry (methods, constructor) */
export interface ITypescriptSignatureEntry extends ITypescriptEntry {
    Parameters?: ITypescriptSimbolEntry[];
    ReturnType?: string;
}

/** Interface with typescript definition entry */
export interface ITypescriptDefinitionEntry extends ITypescriptSimbolEntry {
    Constructors?: ITypescriptSignatureEntry[];
    Methods?: ITypescriptSignatureEntry[];
    Properties?: ITypescriptSimbolEntry[];
}




