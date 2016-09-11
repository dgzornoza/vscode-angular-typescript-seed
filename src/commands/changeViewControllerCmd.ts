import * as vsc from "vscode";
import { injectable  } from "inversify";
import "reflect-metadata";

import { ICommand } from "./../models/command";

@injectable()
export class ChangeViewControllerCmd extends ICommand<any> {

    constructor() {
         super();
    }

    public execute(...params: any[]): void {

        // Get the current text editor
        let editor: vsc.TextEditor = vsc.window.activeTextEditor;
        if (!editor) {
            this._statusBarChangeViewController.hide();
            return;
        }

        let doc: vsc.TextDocument = editor.document;

        // Only update status if an typescript/html file
        if (doc.languageId === "typescript" || doc.languageId === "html") {
            this._statusBarChangeViewController.show();
        } else {
            this._statusBarChangeViewController.hide();
        }

    }

}
