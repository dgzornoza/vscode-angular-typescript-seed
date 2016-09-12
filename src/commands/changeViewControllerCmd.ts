import * as vsc from "vscode";
import { injectable } from "inversify";
import "reflect-metadata";

import { ICommand } from "./../models/command";
import { SeedEnvironmentConfig } from "./../config";

const COMMAND_NAME: string = "atse.changeViewController";

@injectable()
export class ChangeViewControllerCmd extends ICommand<any> {

    constructor() {
        super();
        vsc.commands.registerCommand(COMMAND_NAME, this.execute);
    }

    public execute(...params: any[]): void {

        // set all paths with slash '/' for replace
        let slashRegex: RegExp = /\\/g;
        let docFileName: string = vsc.window.activeTextEditor.document.fileName.replace(slashRegex, "/");

        // get view/controller path to open
        let path: string;
        switch (vsc.window.activeTextEditor.document.languageId) {
            case "typescript":
                path = docFileName.replace(SeedEnvironmentConfig.ControllersBasePath, SeedEnvironmentConfig.ViewBasePath);
                path = path.replace(".controller.ts", ".html");
                break;
            case "html":
                path = docFileName.replace(SeedEnvironmentConfig.ViewBasePath, SeedEnvironmentConfig.ControllersBasePath);
                path = path.replace(".html", ".controller.ts");
                break;

            default: ;
        }

        if (path !== docFileName) {

            vsc.workspace.openTextDocument(path)
                .then((opened: vsc.TextDocument) => vsc.window.showTextDocument(opened),
                (reason: any) => {
                    console.log(reason);
                    vsc.window.showInformationMessage("Not found view/controller");
                });
        } else {
            vsc.window.showInformationMessage("Not found view/controller");
        }

    }

    public canExecute(): boolean {

        let result: boolean = false;

        // Get the current text editor
        let editor: vsc.TextEditor = vsc.window.activeTextEditor;
        if (editor) {

            let doc: vsc.TextDocument = editor.document;

            // Only update status if an typescript/html file
            if (doc.languageId === "typescript" || doc.languageId === "html") {
                result = true;
            }
        }

        return result;
    }

    public getCommandName(): string {
        return COMMAND_NAME;
    }

    public dispose(): void {
        // not used
    }


}
