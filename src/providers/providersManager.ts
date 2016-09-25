import * as vsc from "vscode";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { HtmlTypescriptCompletionItemProvider } from "./htmlTypescriptCompletionItem.provider";


export interface IProvidersManager {
    HtmlTypescriptCompletionItemProvider: HtmlTypescriptCompletionItemProvider;
}


@injectable()
export class ProvidersManager extends Disposable implements IProvidersManager  {

    private _htmlTypescriptCompletionItemProvider: HtmlTypescriptCompletionItemProvider;

    constructor(@inject("HtmlTypescriptCompletionItemProvider") htmlTypescriptCompletionItemProvider: HtmlTypescriptCompletionItemProvider) {
        super();

        // store providers
        this._htmlTypescriptCompletionItemProvider = htmlTypescriptCompletionItemProvider;

        // subscribe providers
        // this._subscriptions.push(vsc.languages.registerCompletionItemProvider(this._htmlTypescriptCompletionItemProvider.getProviderDocumentSelector(),
        //     this._htmlTypescriptCompletionItemProvider,
        //     ...this._htmlTypescriptCompletionItemProvider.getProviderTriggerCharacters()));


    }

    public dispose(): void {
        super.dispose();
    }

    public get HtmlTypescriptCompletionItemProvider(): HtmlTypescriptCompletionItemProvider {
        return this._htmlTypescriptCompletionItemProvider;
    }

}

