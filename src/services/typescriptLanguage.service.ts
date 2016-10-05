import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { injectable } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ITypescriptDefinitionEntry, ITypescriptSimbolEntry, ITypescriptSignatureEntry } from "./../models/interfaces/typescriptLanguage";


const TS_TYPE_INFO_OPTIONS: ts.CompilerOptions = {
        module: ts.ModuleKind.AMD,
        moduleResolution: ts.ModuleResolutionKind.Classic,
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5
};

/**
 * service for manage abstract syntax tree (AST) typescript language
 */
@injectable()
export class TypescriptLanguageService extends Disposable {

    private _typeChecker: ts.TypeChecker;
    private _result: ITypescriptDefinitionEntry[];

    constructor() {
        super();
    }


    /** get typescript file class info.
     * @param file typescript file to process
     * @param definitionName Definition name to get
     * @return Definition
     */
    public getDefinition(file: string, definitionName: string): ITypescriptDefinitionEntry {

        // Build a program using the set of root file names in fileNames
        let program: ts.Program = ts.createProgram([file], TS_TYPE_INFO_OPTIONS);

        // Get the checker, we will use it to find more about classes
        this._typeChecker = program.getTypeChecker();

        this._result = [];

        let sourceFile: ts.SourceFile[] = program.getSourceFiles().filter((value: ts.SourceFile, index: number, array: ts.SourceFile[]) => {
            return path.normalize(value.path).toLowerCase() === file.toLowerCase();
        });

        if (sourceFile.length === 1) {
            ts.forEachChild(sourceFile[0], (node: ts.Node) => { this._findDefinition(node, definitionName); });
        }

        return this._result[0];
    }



    /** recursive function for find definition in node
     * @param node typescript ast node
     * @param definitionName Definition name to find
     */
    private _findDefinition(node: ts.Node, definitionName: string): void {
        // Only consider exported nodes
        if (!this._isNodeExported(node)) {
            return;
        }

        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:

                // This is a namespace, find its children
                ts.forEachChild(node, (_node: ts.Node) => { this._findDefinition(_node, definitionName); });
                break;

            case ts.SyntaxKind.ClassDeclaration:

                if ((node as ts.ClassDeclaration).name.text === definitionName) {
                    // This is a top level class, get its symbol
                    let symbol: ts.Symbol = this._typeChecker.getSymbolAtLocation((node as ts.ClassDeclaration).name);
                    this._result.push(this._getClassEntry(symbol));
                }

                break;

            default:
                break;
        }
    }



    /** Serialize a class symbol information */
    private _getClassEntry(symbol: ts.Symbol): ITypescriptDefinitionEntry {

        // create class entry
        let details: ITypescriptDefinitionEntry = this._getSymbolEntry(symbol);
        details.Methods = [];
        details.Properties = [];

        // add constructors signatures
        let constructorType: ts.Type = this._typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.Constructors = constructorType.getConstructSignatures().map((signature: ts.Signature) => { return this._getSignatureEntry(signature); });

        // add members signatures
        // https://basarat.gitbooks.io/typescript/content/docs/compiler/overview.html
        let classType: ts.Type = this._typeChecker.getTypeAtLocation(symbol.valueDeclaration);
        let classMembers: ts.Symbol[] = this._typeChecker.getPropertiesOfType(classType);

        classMembers.forEach((member: ts.Symbol) => {

            let resolvedMemberType: ts.Type = this._typeChecker.getTypeOfSymbolAtLocation(member, symbol.valueDeclaration);

            switch (member.valueDeclaration.kind) {

                // Methods
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.MethodDeclaration:

                    let signatures: ITypescriptSignatureEntry[] = resolvedMemberType.getCallSignatures().map((signature: ts.Signature) => {
                        return this._getSignatureEntry(signature); });

                    details.Methods = details.Methods.concat(signatures);

                    break;

                // Properties
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.SetAccessor:

                    details.Properties.push(this._getSymbolEntry(member));

                    break;

                default:
                    break;
            }
        });

        return details;
    }

    /** Serialize a signature (call or constrouct) */
    private _getSignatureEntry(signature: ts.Signature): ITypescriptSignatureEntry {

        return {
            Documentation: ts.displayPartsToString(signature.getDocumentationComment()),
            Flag: signature.declaration.flags,
            Kind: signature.declaration.kind,
            Name: signature.declaration.name && signature.declaration.name.getText(),
            Parameters: signature.parameters.map((symbol: ts.Symbol) => { return this._getSymbolEntry(symbol); }),
            ReturnType: this._typeChecker.typeToString(signature.getReturnType())
        };
    }

    /** Serialize a symbol into a json object */
    private _getSymbolEntry(symbol: ts.Symbol): ITypescriptSimbolEntry {

        return {
            Documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
            Flag: symbol.valueDeclaration.flags,
            Kind: symbol.valueDeclaration.kind,
            Name: symbol.getName(),
            Type: this._typeChecker.typeToString(this._typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    /** True if this is visible outside this file, false otherwise */
    private _isNodeExported(node: ts.Node): boolean {

        /* tslint:disable no-bitwise */
        return (node.flags & ts.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
        /* tslint:enable no-bitwise */
    }


}
