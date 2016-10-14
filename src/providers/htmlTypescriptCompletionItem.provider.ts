import * as vsc from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as ts from "typescript";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ViewsControllersService } from "./../services/viewController.service";
import { TypescriptLanguageService } from "./../services/typescriptLanguage.service";
import { ITypescriptDefinitionEntry, ITypescriptSimbolEntry, ITypescriptSignatureEntry, ITypescriptEntry } from "./../models/interfaces/typescriptLanguage";

/** Provider for typescript completion in html view files, completion is in controller scope related */
@injectable()
export class HtmlTypescriptCompletionItemProvider extends Disposable implements vsc.CompletionItemProvider {

    private _viewsControllersService: ViewsControllersService;
    private _typescriptLanguageService: TypescriptLanguageService;
    private _currentControllerRouteAlias: string;
    private _currentControllerClassDefinition: ITypescriptDefinitionEntry;
    private _currentControllerPath: string;

    constructor(@inject("ViewsControllersService") viewsControllersService: ViewsControllersService,
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

        return new Promise((resolve: (value: vsc.CompletionItem[]) => void, reject: (reason?: any) => void) => {

            if (this._currentControllerClassDefinition) {
                let completionItems: vsc.CompletionItem[];

                // verify use controller alias
                let start: vsc.Position = new vsc.Position(0, 0);
                let range: vsc.Range = new vsc.Range(start, position);
                let text: string = document.getText(range);
                // regex for {vm.}, {{vm.}}, "vm.", "{ class: vm.}"
                let completionRegex: RegExp = new RegExp(`[{|{{|"|".*:]\\s*${this._currentControllerRouteAlias}\\.(.*)$`);
                let match: RegExpExecArray = completionRegex.exec(text);

                if (undefined != match) {

                    // search trasversal members
                    if (match[1]) {

                        let objectNames: string[] = match[1].slice(0, -1).split(".");
                        for (let objectName of objectNames) {

                            let currentObject: ITypescriptEntry = this._getClassPublicEntries(this._currentControllerClassDefinition)
                                .find((item: ITypescriptEntry): boolean => {
                                    return item.Name === objectName;
                                });

                            let a = this._typescriptLanguageService.getDefinition(this._currentControllerPath, (currentObject as any).Type);

                            //let importPath: RegExp = new RegExp(`import\s*{.*IUserModel.*}\s*from\s*["|'](.*)["|']`);
                            let b = 5;
                        }

                    // controller members
                    } else {
                        // loop class memembers for set in intellisense
                        completionItems = this._getClassPublicEntries(this._currentControllerClassDefinition).map((item: ITypescriptEntry) => {
                            return this._createCompletionItem(item);
                        });
                    }
                }

                resolve(completionItems);
            }
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

        // parse typescript controller attached to html file for get class definition
        if (vsc.window.activeTextEditor.document.languageId === "html") {

            // get controller path
            let normalizedActiveEditorPath: string = path.normalize(vsc.window.activeTextEditor.document.fileName);
            this._currentControllerPath = this._viewsControllersService.getControllerFromViewPath(normalizedActiveEditorPath);

            fs.exists(this._currentControllerPath, (exists: boolean) => {

                if (exists) {

                    // store controller route alias
                    this._currentControllerRouteAlias = this._viewsControllersService.getControllerRouteAlias(this._currentControllerPath);

                    // get controller class info for intellisense
                    let controllerClassName: string = this._viewsControllersService.getControllerClassNameFromPath(this._currentControllerPath);
                    this._currentControllerClassDefinition = this._typescriptLanguageService.getDefinition(this._currentControllerPath, controllerClassName);

                } else {
                    this._currentControllerClassDefinition = undefined;
                }
            });
        }
    }

    private _getClassPublicEntries(classDefinition: ITypescriptDefinitionEntry): ITypescriptEntry[] {

        let result: ITypescriptEntry[] = [];

        // concat methods and properties
        result = result.concat(classDefinition.Methods).concat(classDefinition.Properties);

        // filter public
        result = result.filter((value: ITypescriptEntry) => {
            /* tslint:disable no-bitwise */
            return (value.Flag & ts.NodeFlags.Public) === ts.NodeFlags.Public;
            /* tslint:enable no-bitwise */
        });

        return result;
    }

    private _createCompletionItem(definition: ITypescriptSimbolEntry): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.Name;
        completionItem.insertText = definition.Name;
        completionItem.label = definition.Name;
        completionItem.documentation = definition.Documentation;
        completionItem.kind = this._convertToVscKind(definition.Kind);
        return completionItem;
    }

    private _convertToVscKind(typescriptKind: number): vsc.CompletionItemKind {

        switch (typescriptKind) {
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.MethodDeclaration:
                    return vsc.CompletionItemKind.Method;

                // Properties
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.SetAccessor:
                    return vsc.CompletionItemKind.Property;

                default: ;
        }
    }
}
