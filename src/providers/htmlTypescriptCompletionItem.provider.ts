import * as vsc from "vscode";
import * as path from "path";
import * as ts from "typescript";
import * as TsTypeInfo from "ts-type-info";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ViewsControllersService } from "./../services/viewController.service";

const TS_TYPE_INFO_OPTIONS: TsTypeInfo.Options = {
    compilerOptions: {
        module: ts.ModuleKind.AMD,
        moduleResolution: ts.ModuleResolutionKind.Classic,
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5
    },
    showDebugMessages: false
};

type MemberDefinition = TsTypeInfo.ClassMethodDefinition | TsTypeInfo.ClassPropertyDefinition |
    TsTypeInfo.ClassStaticMethodDefinition | TsTypeInfo.ClassStaticPropertyDefinition

/** Provider for typescript completion in html view files, completion is in controller scope related */
@injectable()
export class HtmlTypescriptCompletionItemProvider extends Disposable implements vsc.CompletionItemProvider {

    private _viewsControllersService: ViewsControllersService;
    private _currentControllerClassDefinition: TsTypeInfo.ClassDefinition;
    private _currentControllerRouteAlias: string;

    constructor( @inject("ViewsControllersService") viewsControllersService: ViewsControllersService) {
        super();

        this._viewsControllersService = viewsControllersService;

        // subscribe to events
        vsc.window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, this._subscriptions);

        // first call to events
        this._onDidChangeActiveTextEditor();
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

        return new Promise((resolve: (value: vsc.CompletionItem[]) => void, reject: (reason?: any) => void) => {

            // loop class memembers for set in intellisense
            let completionItems: vsc.CompletionItem[] = this._getClassPublicMembers().map((item: MemberDefinition) => {
                return this._createCompletionItem(item);
            });

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

        // parse typescript controller attached to html file for intellisense
        if (vsc.window.activeTextEditor.document.languageId === "html") {

            // get controller path
            let normalizedActiveEditorPath: string = path.normalize(vsc.window.activeTextEditor.document.fileName);
            let controllerPath: string = this._viewsControllersService.getControllerFromViewPath(normalizedActiveEditorPath);

            // get controller class info for intellisense
            let tsInfo: TsTypeInfo.GlobalDefinition = TsTypeInfo.getInfoFromFiles([controllerPath], TS_TYPE_INFO_OPTIONS);
            this._currentControllerClassDefinition = tsInfo.getFile("users.controller.ts").getClass("UsersController");

            // get controller route alias
            this._currentControllerRouteAlias = this._viewsControllersService.getControllerRouteAlias(controllerPath);
        }
    }

    private _getClassPublicMembers(): MemberDefinition[] {

        let result: MemberDefinition[] = [];

        // concat methods, properties and statics
        result = result.concat(this._currentControllerClassDefinition.methods)
            .concat(this._currentControllerClassDefinition.properties)
            .concat(this._currentControllerClassDefinition.staticMethods)
            .concat(this._currentControllerClassDefinition.staticProperties);

        // filter public
        result = result.filter((value: TsTypeInfo.ClassMethodDefinition) => {
            return value.scope === "public";
        });

        return result;
    }

    private _createCompletionItem(definition: MemberDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Method;
        return completionItem;
    }
}
