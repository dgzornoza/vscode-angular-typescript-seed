import * as ts from "typescript";
import * as fs from "fs";
import { injectable } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ITypescriptClassEntry, ITypescriptSimbolEntry, ITypescriptSignatureEntry } from "./../models/interfaces/typescriptLanguage";

/**
 * service for manage abstract syntax tree (AST) typescript language
 */
@injectable()
export class TypescriptLanguageService extends Disposable {

    private _typeChecker: ts.TypeChecker;
    private _result: ITypescriptClassEntry[];

    constructor() {
        super();
    }


    /** Generate documentation for all classes in a set of .ts files
     * @param fileNames typescript files for generate documentation
     * @param outputFileName output path + filename documentation
     * @options typescript options
     */
    public generateDocumentation(fileNames: string[], outputFileName: string, options: ts.CompilerOptions): void {

        // Build a program using the set of root file names in fileNames
        let program: ts.Program = ts.createProgram(fileNames, options);

        // Get the checker, we will use it to find more about classes
        this._typeChecker = program.getTypeChecker();

        this._result = [];

        // Visit every sourceFile in the program
        for (const sourceFile of program.getSourceFiles()) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, (node: ts.Node) => { this._visit(node); });
        }

        // print out the doc
        // fs.writeFileSync(outputFileName, JSON.stringify(this._tempResult, undefined, 4));
    }



    /** visit nodes finding exported classes */
    private _visit(node: ts.Node): void {
        // Only consider exported nodes
        if (!this._isNodeExported(node)) {
            return;
        }

        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:

                // This is a namespace, visit its children
                ts.forEachChild(node, (_node: ts.Node) => { this._visit(_node); });
                break;

            case ts.SyntaxKind.ClassDeclaration:

                 // This is a top level class, get its symbol
                let symbol: ts.Symbol = this._typeChecker.getSymbolAtLocation((node as ts.ClassDeclaration).name);
                this._result.push(this._getClassEntry(symbol));
                break;

            default:
                break;
        }
    }



    /** Serialize a class symbol information */
    private _getClassEntry(symbol: ts.Symbol): ITypescriptClassEntry {

        // create class entry
        let details: ITypescriptClassEntry = this._getSymbolEntry(symbol);

        // add constructors signatures
        let constructorType: ts.Type = this._typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.constructors = constructorType.getConstructSignatures().map((signature: ts.Signature) => { return this._getSignatureEntry(signature); });

        // add members signatures
        // https://basarat.gitbooks.io/typescript/content/docs/compiler/overview.html
        let classType: ts.Type = this._typeChecker.getTypeAtLocation(symbol.valueDeclaration);
        let props: ts.Symbol[] = this._typeChecker.getPropertiesOfType(classType);
        props.forEach((prop: ts.Symbol) => {
            let resolvedPropertyType: ts.Type = this._typeChecker.getTypeOfSymbolAtLocation(prop, undefined);
            let temp: any = resolvedPropertyType.getCallSignatures().map((signature: ts.Signature) => { return this._getSignatureEntry(signature); });


            console.log(resolvedPropertyType);
        });

        return details;
    }

    /** Serialize a signature (call or constrouct) */
    private _getSignatureEntry(signature: ts.Signature): ITypescriptSignatureEntry {
        return {
            documentation: ts.displayPartsToString(signature.getDocumentationComment()),
            parameters: signature.parameters.map((symbol: ts.Symbol) => { return this._getSymbolEntry(symbol); }),
            returnType: this._typeChecker.typeToString(signature.getReturnType())
        };
    }

    /** Serialize a symbol into a json object */
    private _getSymbolEntry(symbol: ts.Symbol): ITypescriptSimbolEntry {
        return {
            documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
            name: symbol.getName(),
            type: this._typeChecker.typeToString(this._typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    /** True if this is visible outside this file, false otherwise */
    private _isNodeExported(node: ts.Node): boolean {

        /* tslint:disable no-bitwise */
        return (node.flags & ts.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
        /* tslint:enable no-bitwise */
    }


}
