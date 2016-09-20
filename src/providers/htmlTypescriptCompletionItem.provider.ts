import * as vsc from "vscode";
import * as path from "path";
import * as ts from "typescript";
import * as TsTypeInfo from "ts-type-info";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ViewsControllersService } from "./../services/viewController.service";
import { TypescriptLanguageService } from "./../services/typescriptLanguage.service";


/** Provider for typescript completion in html view files, completion is in controller scope related */
@injectable()
export class HtmlTypescriptCompletionItemProvider extends Disposable implements vsc.CompletionItemProvider {

    private _viewsControllersService: ViewsControllersService;
    private _typescriptLanguageService: TypescriptLanguageService;

    constructor( @inject("ViewsControllersService") viewsControllersService: ViewsControllersService,
        @inject("TypescriptLanguageService") typescriptLanguageService: TypescriptLanguageService) {
        super();

        this._viewsControllersService = viewsControllersService;
        this._typescriptLanguageService = typescriptLanguageService;

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

            let completionItems: vsc.CompletionItem[] = [];
            let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
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

        // parse typescript controller attached to html file for intellisense
        if (vsc.window.activeTextEditor.document.languageId === "html") {

            let normalizedActiveEditorPath: string = path.normalize(vsc.window.activeTextEditor.document.fileName);
            let resolvedPath: string = this._viewsControllersService.getControllerFromViewPath(vsc.window.activeTextEditor.document.fileName);


            //let basePath = "d:\\Projects\\OpenSource\\angular-typescript-seed\\";
            let basePath = "C:\\Datos\\Proyectos\\dgzornoza\\OpenSource\\angular-typescript-seed\\";

            let files = [
                basePath + "src\\app\\config.ts",
                basePath + "src\\app\\helpers.ts",
                basePath + "src\\app\\main.ts",
                basePath + "src\\app\\routesConfig.ts",
                basePath + "src\\app\\controllers\\about.controller.ts",
                basePath + "src\\app\\controllers\\contact.controller.ts",
                basePath + "src\\app\\controllers\\home.controller.ts",
                basePath + "src\\app\\controllers\\users.controller.ts",
                basePath + "src\\app\\directives\\dialog.directive.ts",
                basePath + "src\\app\\services\\httpInterceptor.service.ts",
                basePath + "src\\app\\services\\routeResolver.provider.ts",
                basePath + "src\\app\\services\\users.service.ts",
                basePath + "src\\app\\models\\users.d.ts"];

            // this._typescriptLanguageService.generateDocumentation(files, "",
            // {
            //     noEmitOnError: true, noImplicitAny: true,
            //     target: ts.ScriptTarget.ES5, module: ts.ModuleKind.AMD
            // });

            // TsParameteredBinderByNode:
            // param.sourceFile.fileName === "C:/Datos/Proyectos/dgzornoza/OpenSource/angular-typescript-seed/src/app/controllers/users.controller.ts"
            // tsNode: 413
            const result = TsTypeInfo.getInfoFromFiles(files,
                {
                    compilerOptions:
                    {
                        "module": "amd",
                        "rootDir": "..",
                        //"moduleResolution": "classic",
                        "emitDecoratorMetadata": true,
                        "experimentalDecorators": true,
                        "noImplicitAny": false,
                        "noEmitOnError": true,
                        "removeComments": false,
                        "target": "es5",
                        "declaration": false,
                        "inlineSourceMap": true,
                        "inlineSources": false
                    },
                    showDebugMessages: true
                });

            // let c = result.getFile("users.d.ts").getInterface("IUserModel");
            let d = result.getFile("users.controller.ts").getClass("UsersController").getMethod("testadgz");
            // const property = result.getFile("TestFile.ts")
            //     .getClass("MyClass")                            // get first by name
            //     .getProperty(p => p.defaultExpression != null); // or first by what matches

            let y = 5;

        }

    }
}
