import * as vsc from "vscode";
import * as path from "path";
import * as fs from "fs";
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
type TypedDefinitions = (TsTypeInfo.ClassDefinition | TsTypeInfo.FunctionDefinition | TsTypeInfo.InterfaceDefinition |
    TsTypeInfo.EnumDefinition | TsTypeInfo.NamespaceDefinition | TsTypeInfo.VariableDefinition | TsTypeInfo.TypeAliasDefinition)[]

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

                            let currentObject: MemberDefinition = this._getClassPublicMembers(this._currentControllerClassDefinition)
                                .find((member: MemberDefinition): boolean => {
                                    return member.name === objectName;
                                });

                            // property
                            if ((currentObject as TsTypeInfo.ClassPropertyDefinition).isAccessor) {
                                let a = (currentObject as TsTypeInfo.ClassPropertyDefinition).type.definitions;
                                let b = 5;
                            }
                        }

                    // controller members
                    } else {
                        // loop class memembers for set in intellisense
                        completionItems = this._getClassPublicMembers(this._currentControllerClassDefinition).map((item: MemberDefinition) => {
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
            let controllerPath: string = this._viewsControllersService.getControllerFromViewPath(normalizedActiveEditorPath);

            fs.exists(controllerPath, (exists: boolean) => {

                if (exists) {
                    // store controller route alias
                    this._currentControllerRouteAlias = this._viewsControllersService.getControllerRouteAlias(controllerPath);

                    // get controller class info for intellisense
                    let controllerClassName: string = this._viewsControllersService.getControllerClassNameFromPath(controllerPath);
                    let tsInfo: TsTypeInfo.GlobalDefinition = TsTypeInfo.getInfoFromFiles([controllerPath], TS_TYPE_INFO_OPTIONS);
                    this._currentControllerClassDefinition = tsInfo.getFile(controllerPath.split("\\").pop()).getClass(controllerClassName);

                } else {
                    this._currentControllerClassDefinition = undefined;
                }
            });
        }
    }

    private _getClassPublicMembers(classDefinition: TsTypeInfo.ClassDefinition): MemberDefinition[] {

        let result: MemberDefinition[] = [];

        // concat methods, properties and statics
        result = result.concat(classDefinition.methods)
            .concat(classDefinition.properties)
            .concat(classDefinition.staticMethods)
            .concat(classDefinition.staticProperties);

        // filter public
        result = result.filter((value: TsTypeInfo.ClassMethodDefinition) => {
            return value.scope === "public";
        });

        return result;
    }

    // private _getTypedPublicMembers(typedDefinition: TsTypeInfo.TypedDefinition[]): MemberDefinition[] {

    //     let result: MemberDefinition[] = [];

    //     // concat methods, properties and statics
    //     result = result.concat(typedDefinition.)
    //         .concat(classDefinition.properties)
    //         .concat(classDefinition.staticMethods)
    //         .concat(classDefinition.staticProperties);

    //     // filter public
    //     result = result.filter((value: TsTypeInfo.ClassMethodDefinition) => {
    //         return value.scope === "public";
    //     });

    //     return result;
    // }

    private _createCompletionItem(definition: MemberDefinition): vsc.CompletionItem {

        let completionItem: vsc.CompletionItem = new vsc.CompletionItem("id");
        completionItem.filterText = definition.name;
        completionItem.insertText = definition.name;
        completionItem.label = definition.name;
        completionItem.kind = vsc.CompletionItemKind.Method;
        return completionItem;
    }
}
