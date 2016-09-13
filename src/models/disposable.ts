import * as vsc from "vscode";
import { injectable } from "inversify";


export interface IDisposable {
    dispose(): void;
}

/**
 * interface for implement disposable base class
 */
@injectable()
export abstract class Disposable implements IDisposable {

    protected _subscriptions: vsc.Disposable[];

    constructor() {
        this._subscriptions = [];
    }

    /** if override in child class, should be invoke this ('super.dispose()') */
    public dispose(): void {
        while (this._subscriptions.length) {
            this._subscriptions.pop().dispose();
        }
    }
}
