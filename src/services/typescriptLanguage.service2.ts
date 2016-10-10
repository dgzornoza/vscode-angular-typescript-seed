import * as vsc from "vscode";
import * as lc from "vscode-languageclient";
import * as path from "path";
import { injectable } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";

/**
 * service for manage abstract syntax tree (AST) typescript language
 */
@injectable()
export class TypescriptLanguageService2 extends Disposable {


    constructor() {
        super();

        this._initialize();
    }

    private _initialize(): void {

        // The server is implemented in node
        let serverModule: string = path.join(vsc.workspace.rootPath, "server", "server.js");
        // The debug options for the server
        let debugOptions: lc.ForkOptions = { execArgv: ["--nolazy", "--debug=6004"] };

        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        let serverOptions: lc.ServerOptions = {
            debug: { module: serverModule,  options: debugOptions, transport: lc.TransportKind.ipc },
            run : { module: serverModule, transport: lc.TransportKind.ipc }
        };

        // Options to control the language client
        let clientOptions: lc.LanguageClientOptions = {
            // Register the server for documents
            documentSelector: ["plaintext"],
            synchronize: {
                // Synchronize the setting section "languageServerExample" to the server
                configurationSection: "languageServerExample",
                // Notify the server about file changes to ".clientrc files contain in the workspace
                fileEvents: vsc.workspace.createFileSystemWatcher("**/.clientrc")
            }
        };

        // Push the disposable to the context"s subscriptions so that the
        // client can be deactivated on extension deactivation
        // Create the language client, start the client.
        this._subscriptions.push(new lc.LanguageClient("Language Server Example", serverOptions, clientOptions).start());

    }


}
