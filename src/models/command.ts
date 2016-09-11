
/**
 * interface for implement commands
 */
export abstract class ICommand<TParams> {

    protected _isEnabled: boolean;

    constructor() {
        this._isEnabled = true;
    }

    public abstract execute(...params: TParams[]): void;

    public canExecute(...params: TParams[]): boolean {
        // default value
        return true;
    }

    public isEnabled(): boolean { return this._isEnabled; }

}
