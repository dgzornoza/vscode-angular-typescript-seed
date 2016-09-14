/** Interface for create pair keys/values */
export interface IKeyValueMap<T> {
    [key: string]: T;
}

export interface IResolve<T> {
    (value?: T | PromiseLike<T>): void;
}

export interface IReject {
    (reason?: any): void;
}


