import * as vsc from "vscode";
import { injectable } from "inversify";
import "reflect-metadata";

import { IDisposable } from "./../models/interfaces/common";

export interface IStatusBar extends IDisposable {

}

@injectable()
export class StatusBar implements IStatusBar  {

    private _statusBarChangeViewController: vsc.StatusBarItem;
    private _disposable:  vsc.Disposable;

    constructor() {

        // Create as needed
        if (!this._statusBarChangeViewController) {
            this._statusBarChangeViewController = vsc.window.createStatusBarItem(vsc.StatusBarAlignment.Left);
            this._statusBarChangeViewController.text = "$(file-code)";
            this._statusBarChangeViewController.tooltip = "Cambiar Vista/controlador";
            this._statusBarChangeViewController.show();
        }

        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor);


        // subscribe to selection change and editor activation events
        let subscriptions: vsc.Disposable[] = [];
        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, subscriptions);

        // create a combined disposable from both event subscriptions
        this._disposable = vsc.Disposable.from(...subscriptions);
    }

    public dispose(): void {
        this._statusBarChangeViewController.dispose();
        this._disposable.dispose();
    }

    // private _onDidChangeActiveTextEditor(): void {

    //     // Get the current text editor
    //     let editor: vsc.TextEditor = vsc.window.activeTextEditor;
    //     if (!editor) {
    //         this._statusBarChangeViewController.hide();
    //         return;
    //     }

    //     let doc: vsc.TextDocument = editor.document;

    //     // Only update status if an typescript/html file
    //     if (doc.languageId === "typescript" || doc.languageId === "html") {
    //         this._statusBarChangeViewController.show();
    //     } else {
    //         this._statusBarChangeViewController.hide();
    //     }

    // }

}
