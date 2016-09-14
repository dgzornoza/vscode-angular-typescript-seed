import * as vsc from "vscode";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ChangeViewControllerCmd } from "./../commands/changeViewController.cmd";


// --------------------------------------------
// StatusBar items
// --------------------------------------------


@injectable()
export class StatusBarChangeViewItem extends Disposable {

    private _statusBarItem: vsc.StatusBarItem;
    private _changeViewControllerCmd: ChangeViewControllerCmd;

    constructor(@inject("ChangeViewControllerCmd") changeViewControllerCmd: ChangeViewControllerCmd) {
        super();

        this._changeViewControllerCmd = changeViewControllerCmd;

        // Create as needed
        if (!this._statusBarItem) {
            this._create();
        }

        // subscribe to events
        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, this._subscriptions);
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


export interface IStatusBar {
    StatusBarChangeViewItem: StatusBarChangeViewItem;
}

@injectable()
export class StatusBar extends Disposable implements IStatusBar  {

    private _statusBarChangeViewItem: StatusBarChangeViewItem;

    constructor(@inject("StatusBarChangeViewItem") statusBarChangeViewItem: StatusBarChangeViewItem) {
        super();
        this._statusBarChangeViewItem = statusBarChangeViewItem;
    }

    public dispose(): void {
        super.dispose();
    }

    public get StatusBarChangeViewItem(): StatusBarChangeViewItem {
        return this._statusBarChangeViewItem;
    }

}

