import * as vsc from "vscode";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { IDisposable } from "./../models/interfaces/common";
import { ChangeViewControllerCmd } from "./../commands/changeViewControllerCmd";


// --------------------------------------------
// StatusBar items
// --------------------------------------------

/** Clase base for inherit statusbar items
 * @remarks should be call base dispose in dispose method
 */
@injectable()
abstract class IStatusBarItem implements IDisposable {

    protected _statusBarItem: vsc.StatusBarItem;
    protected _disposable:  vsc.Disposable;

    public dispose(): void {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }
}

@injectable()
export class StatusBarChangeViewItem extends IStatusBarItem {

    private _changeViewControllerCmd: ChangeViewControllerCmd;

    constructor(@inject("ChangeViewControllerCmd") changeViewControllerCmd: ChangeViewControllerCmd) {
        super();

        this._changeViewControllerCmd = changeViewControllerCmd;

        // Create as needed
        if (!this._statusBarItem) {
            this._create();
        }

        // subscribe to events
        let subscriptions: vsc.Disposable[] = [];
        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, subscriptions);

        // create a combined disposable from event subscriptions
        this._disposable = vsc.Disposable.from(...subscriptions);
    }

    public dispose(): void {
        super.dispose();
    }


    private _create(): void {
        this._statusBarItem = vsc.window.createStatusBarItem(vsc.StatusBarAlignment.Left);
        this._statusBarItem.text = "$(file-code)";
        this._statusBarItem.tooltip = "Change View/Controller";
        this._statusBarItem.command = this._changeViewControllerCmd.getCommandName();

        this._onDidChangeActiveTextEditor();
    };

    private _onDidChangeActiveTextEditor(): void {

        // show/hide statusbar item
        if (this._changeViewControllerCmd.canExecute()) {
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

}


// --------------------------------------------
// StatusBar
// --------------------------------------------


export interface IStatusBar extends IDisposable {
    StatusBarChangeViewItem: StatusBarChangeViewItem;
}

@injectable()
export class StatusBar implements IStatusBar  {

    private _statusBarChangeViewItem: StatusBarChangeViewItem;

    constructor(@inject("StatusBarChangeViewItem") statusBarChangeViewItem: StatusBarChangeViewItem) {
        this._statusBarChangeViewItem = statusBarChangeViewItem;
    }

    public dispose(): void {
        // not used
    }

    public get StatusBarChangeViewItem(): StatusBarChangeViewItem {
        return this._statusBarChangeViewItem;
    }

}

