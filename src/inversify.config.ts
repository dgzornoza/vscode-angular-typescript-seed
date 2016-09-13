import * as vsc from "vscode";
import { Kernel } from "inversify";
import { IDisposable } from "./models/interfaces/common";
import { IStatusBar, StatusBar, StatusBarChangeViewItem } from "./components/statusBar";
import { ChangeViewControllerCmd } from "./commands/changeViewControllerCmd";

/** Class for configure IOC + DI from inversify library
 * https://github.com/inversify/InversifyJS
 */
export class InversifyConfig {

    private static _kernel: inversify.interfaces.Kernel;
    private static _extensionContext: vsc.ExtensionContext;

    public static initialize(context: vsc.ExtensionContext): void {

        InversifyConfig._extensionContext = context;
        InversifyConfig._kernel = new Kernel();

        // define IOC
        InversifyConfig._kernel.bind<IStatusBar>("IStatusBar").to(StatusBar).inSingletonScope().onActivation(InversifyConfig._subscribe);
        InversifyConfig._kernel.bind<StatusBarChangeViewItem>("StatusBarChangeViewItem")
            .to(StatusBarChangeViewItem).inSingletonScope().onActivation(InversifyConfig._subscribe);

        // Commands
        InversifyConfig._kernel.bind<ChangeViewControllerCmd>("ChangeViewControllerCmd")
            .to(ChangeViewControllerCmd).inSingletonScope().onActivation(InversifyConfig._subscribe);

    }

    public static get Kernel(): inversify.interfaces.Kernel {
        return InversifyConfig._kernel;
    }


    private static _subscribe<T extends IDisposable>(context: inversify.interfaces.Context, injectable: T): T {

            // Add to a list of disposables which are disposed when this extension is deactivated.
            InversifyConfig._extensionContext.subscriptions.push(injectable);

            return injectable;
    }

}