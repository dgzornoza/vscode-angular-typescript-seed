import * as ts from "typescript";
import * as fs from "fs";
import { injectable } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { ITypescriptDocumentEntry } from "./../models/interfaces/typescriptLanguage";

/**
 * service for manage abstract syntax tree (AST) typescript language
 */
@injectable()
export class TypescriptLanguageService extends Disposable {

    private _tempTypeChecker: ts.TypeChecker;
    private _tempResult: ITypescriptDocumentEntry[];

    constructor() {
        super();
    }


    /** Generate documention for all classes in a set of .ts files
     * @param fileNames typescript files for generate documention
     * @param outputFileName output path + filename documention
     * @options typescript options
     */
    public generateDocumentation(fileNames: string[], outputFileName: string, options: ts.CompilerOptions): void {

        // Build a program using the set of root file names in fileNames
        let program: ts.Program = ts.createProgram(fileNames, options);

        // Get the checker, we will use it to find more about classes
        this._tempTypeChecker = program.getTypeChecker();

        this._tempResult = [];

        // Visit every sourceFile in the program
        for (const sourceFile of program.getSourceFiles()) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, (node: ts.Node) => { this._visit(node); });
        }

        // print out the doc
        fs.writeFileSync(outputFileName, JSON.stringify(this._tempResult, undefined, 4));
    }



    /** visit nodes finding exported classes */
    private _visit(node: ts.Node): void {
        // Only consider exported nodes
        if (!this._isNodeExported(node)) {
            return;
        }

        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            let symbol: ts.Symbol = this._tempTypeChecker.getSymbolAtLocation((node as ts.ClassDeclaration).name);
            this._tempResult.push(this._serializeClass(symbol));
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported

        } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            ts.forEachChild(node, (_node: ts.Node) => { this._visit(_node); });
        }
    }



    /** Serialize a class symbol infomration */
    private _serializeClass(symbol: ts.Symbol): ITypescriptDocumentEntry {
        let details: ITypescriptDocumentEntry = this._serializeSymbol(symbol);

        // Get the construct signatures
        let constructorType: ts.Type = this._tempTypeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.constructors = constructorType.getConstructSignatures().map((signature: ts.Signature) => { return this._serializeSignature(signature); });
        return details;
    }

    /** Serialize a signature (call or construct) */
    private _serializeSignature(signature: ts.Signature): ITypescriptDocumentEntry {
        return {
            documentation: ts.displayPartsToString(signature.getDocumentationComment()),
            parameters: signature.parameters.map((symbol: ts.Symbol) => { return this._serializeSymbol(symbol); }),
            returnType: this._tempTypeChecker.typeToString(signature.getReturnType())
        };
    }

    /** Serialize a symbol into a json object */
    private _serializeSymbol(symbol: ts.Symbol): ITypescriptDocumentEntry {
        return {
            documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
            name: symbol.getName(),
            type: this._tempTypeChecker.typeToString(this._tempTypeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }

    /** True if this is visible outside this file, false otherwise */
    private _isNodeExported(node: ts.Node): boolean {

        /* tslint:disable no-bitwise */
        return (node.flags & ts.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
        /* tslint:enable no-bitwise */
    }


}
