import * as vsc from "vscode";
import { Kernel } from "inversify";
import { IDisposable } from "./models/interfaces/common";
import { StatusBar, IStatusBar } from  "./components/statusBar";

/** Class for configure IOC + DI from inversify library
 * https://github.com/inversify/InversifyJS
 */
export class InversifyConfig {

    private static _kernel: inversify.interfaces.Kernel;
    private static _context: vsc.ExtensionContext;

    public static initialize(context: vsc.ExtensionContext): void {

        InversifyConfig._context = context;
        InversifyConfig._kernel = new Kernel();

        // define IOC
        InversifyConfig._kernel.bind<IStatusBar>("IStatusBar").to(StatusBar).inSingletonScope();//.onActivation((a,b) => InversifyConfig._subscribe(a,b));


    }

    public static get Kernel(): inversify.interfaces.Kernel {
        return InversifyConfig._kernel;
    }


    private static _subscribe<T extends IDisposable>(context: inversify.interfaces.Context, injectable: T): T {

            // Add to a list of disposables which are disposed when this extension is deactivated.
            InversifyConfig._context.subscriptions.push(injectable);

            return injectable;
    }

}
