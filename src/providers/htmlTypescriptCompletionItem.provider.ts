import * as vsc from "vscode";
import * as path from "path";
import * as ts from "typescript";
import * as TsTypeInfo from "ts-type-info";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ViewsControllersService } from "./../services/viewController.service";


const TS_TYPE_INFO_OPTIONS: TsTypeInfo.Options =
    {
        compilerOptions: {
            module: ts.ModuleKind.AMD,
            moduleResolution: ts.ModuleResolutionKind.Classic,
            noEmitOnError: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5
        },
        showDebugMessages: false
    };

/** Provider for typescript completion in html view files, completion is in controller scope related */
@injectable()
export class HtmlTypescriptCompletionItemProvider extends Disposable implements vsc.CompletionItemProvider {

    private _viewsControllersService: ViewsControllersService;
    private _currentControllerClassDefinition: TsTypeInfo.ClassDefinition;

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

        return new Promise((resolve, reject) => {

            // loop class memembers for set in intellisense
            let methods: vsc.CompletionItem[] = this._currentControllerClassDefinition.methods
                .filter((value: TsTypeInfo.ClassMethodDefinition) => {
                    return value.scope === "public";
                })
                .map((value: TsTypeInfo.ClassMethodDefinition) => {
                    return this._createCompletionItemFromMethod(value);
                });

            let properties: vsc.CompletionItem[] = this._currentControllerClassDefinition.properties
                .filter((value: TsTypeInfo.ClassPropertyDefinition) => {
                    return value.scope === "public";
                })
                .map((value: TsTypeInfo.ClassPropertyDefinition) => {
                    return this._createCompletionItemFromProperty(value);
                });

            let staticMethods: vsc.CompletionItem[] = this._currentControllerClassDefinition.staticMethods
                .filter((value: TsTypeInfo.ClassStaticMethodDefinition) => {
                    return value.scope === "public";
                })
                .map((value: TsTypeInfo.ClassStaticMethodDefinition) => {
                    return this._createCompletionItemFromStaticMethod(value);
                });

            let staticsProperties: vsc.CompletionItem[] = this._currentControllerClassDefinition.staticProperties
                .filter((value: TsTypeInfo.ClassStaticPropertyDefinition) => {
                    return value.scope === "public";
                })
                .map((value: TsTypeInfo.ClassStaticPropertyDefinition) => {
                    return this._createCompletionItemFromStaticProperty(value);
                });

            let completionItems: vsc.CompletionItem[] = methods.concat(properties).concat(staticMethods).concat(staticsProperties);

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
        }
    }

    private _createCompletionItemFromMethod(definition: TsTypeInfo.ClassMethodDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Method;
        return completionItem;
    }

    private _createCompletionItemFromProperty(definition: TsTypeInfo.ClassPropertyDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Property;
        return completionItem;
    }

    private _createCompletionItemFromStaticMethod(definition: TsTypeInfo.ClassStaticMethodDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Function;
        return completionItem;
    }

    private _createCompletionItemFromStaticProperty(definition: TsTypeInfo.ClassStaticPropertyDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Property;
        return completionItem;
    }
}
