import * as vsc from "vscode";
import { injectable } from "inversify";
import "reflect-metadata";

import { IDisposable } from "./../models/interfaces/common";


// --------------------------------------------
// StatusBar items
// --------------------------------------------

abstract class IStatusBarItem implements IDisposable {

    protected _statusItem: vsc.StatusBarItem;
    protected _disposable:  vsc.Disposable;

    public dispose(): void {
        this._statusItem.dispose();
        this._disposable.dispose();
    }
}

//@injectable()
export class StatusBarChangeViewItem extends IStatusBarItem {



        constructor() {
            super();

            // Create as needed
            if (!this._statusItem) {
                this._statusItem = vsc.window.createStatusBarItem(vsc.StatusBarAlignment.Left);
                this._statusItem.text = "$(file-code)";
                this._statusItem.tooltip = "Cambiar Vista/controlador";
                this._statusItem.show();
            }

            // vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor);


            // // subscribe to selection change and editor activation events
            // let subscriptions: vsc.Disposable[] = [];
            // vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, subscriptions);

            // // create a combined disposable from both event subscriptions
            // this._disposable = vsc.Disposable.from(...subscriptions);
        }

        public dispose(): void {
            let a: number = 5;
            let b: number = a/5;
        }

}


// --------------------------------------------
// StatusBar
// --------------------------------------------


export interface IStatusBar extends IDisposable {

}

@injectable()
export class StatusBar implements IStatusBar  {

    private _statusBarChangeViewItem: StatusBarChangeViewItem;

    // constructor(@inject("StatusBarChangeViewItem") statusBarChangeViewItem: StatusBarChangeViewItem) {
    //     this._statusBarChangeViewItem = statusBarChangeViewItem;
    // }
    constructor() {

    }

    public dispose(): void {
        let a: number = 5;
        let b: number = a / 5;
    }

}

