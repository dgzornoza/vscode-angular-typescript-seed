import { injectable } from "inversify";
import { IDisposable } from "./../models/interfaces/common";


/**
 * interface for implement commands
 */
@injectable()
export abstract class ICommand<TParams> implements IDisposable {

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

    public abstract getCommandName(): string;
    public abstract dispose(): void;
}
