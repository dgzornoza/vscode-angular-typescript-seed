import * as vsc from "vscode";
import { injectable } from "inversify";
import "reflect-metadata";

import { SeedEnvironmentConfig } from "./../config";
import { Disposable } from "./../models/disposable";


@injectable()
export class HtmlTypescriptCompletionItemProvider extends Disposable implements vsc.CompletionItemProvider {

    constructor() {
        super();

        // subscribe to events
        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, this._subscriptions);

    }


    /**
     * Provide completion items for the given position and document.
     *
     * @param document The document in which the command was invoked.
     * @param position The position at which the command was invoked.
     * @param token A cancellation token.
     * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
     * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
     */
    public provideCompletionItems(document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] |
        Thenable<vsc.CompletionItem[]> | vsc.CompletionList | Thenable<vsc.CompletionList> {

        return new Promise((resolve, reject) => { 

            var completionItems:vsc.CompletionItem[] = [];
            var completionItem:vsc.CompletionItem = new vsc.CompletionItem("id");
            completionItem.detail = "test javascript detail";
            completionItem.documentation = "sdfsd";
            completionItem.filterText = "test";
            completionItem.insertText = "bb";
            completionItem.label = "test";

            completionItems.push(completionItem);
            resolve(completionItems);
        });
    }

    public dispose(): void {
        // not used
    }

    /** Get selector that defines the documents this provider is applicable to. */
    public getProviderDocumentSelector(): vsc.DocumentSelector {
        return ["html"];
    }

    /** Get trigger characters */
    public getProviderTriggerCharacters(): string[] {
        return ["."];
    }



    private _onDidChangeActiveTextEditor(): void {

        
    }
}
