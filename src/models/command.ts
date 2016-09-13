import { injectable } from "inversify";
import { Disposable } from "./../models/disposable";


/**
 * interface for implement commands
 */
@injectable()
export abstract class ICommand<TParams> extends Disposable {

    protected _isEnabled: boolean;

    constructor() {
        super();
        this._isEnabled = true;
    }

    public abstract execute(...params: TParams[]): void;

    public canExecute(...params: TParams[]): boolean {
        // default value
        return true;
    }

    public isEnabled(): boolean { return this._isEnabled; }

    public abstract getCommandName(): string;

    public dispose(): void {
        super.dispose();
    }
}
