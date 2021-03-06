import * as vsc from "vscode";
import * as inversify from "inversify";

import { IDisposable } from "./models/disposable";

import { ExtensionConfig } from "./config";

import { IStatusBar, StatusBar, StatusBarChangeViewItem } from "./components/statusBar.component";

import { ChangeViewControllerCmd } from "./commands/changeViewController.cmd";

import { ProvidersManager } from "./providers/providersManager";
import { HtmlTypescriptCompletionItemProvider } from "./providers/htmlTypescriptCompletionItem.provider";

import { ViewsControllersService } from "./services/viewController.service";
import { TypescriptLanguageService } from "./services/typescriptLanguage.service";
import { TypescriptLanguageService2 } from "./services/typescriptLanguage.service2";


/** Class for configure IOC + DI from inversify library
 * https://github.com/inversify/InversifyJS
 */
export class InversifyConfig {

    private static _kernel: inversify.interfaces.Kernel;
    private static _extensionContext: vsc.ExtensionContext;

    public static initialize(extensionContext: vsc.ExtensionContext): void {

        InversifyConfig._extensionContext = extensionContext;
        InversifyConfig._kernel = new inversify.Kernel();

        // define IOC

        // Configuration
        InversifyConfig._kernel.bind<ExtensionConfig>("ExtensionConfig")
            .toDynamicValue((context: inversify.interfaces.Context) => { return new ExtensionConfig(extensionContext); })
            .inSingletonScope().onActivation(InversifyConfig._subscribe);

        // UI
        InversifyConfig._kernel.bind<IStatusBar>("IStatusBar").to(StatusBar).inSingletonScope().onActivation(InversifyConfig._subscribe);

        InversifyConfig._kernel.bind<StatusBarChangeViewItem>("StatusBarChangeViewItem")
            .to(StatusBarChangeViewItem).inSingletonScope().onActivation(InversifyConfig._subscribe);

        // Commands
        InversifyConfig._kernel.bind<ChangeViewControllerCmd>("ChangeViewControllerCmd")
            .to(ChangeViewControllerCmd).inSingletonScope().onActivation(InversifyConfig._subscribe);

        // Providers
        InversifyConfig._kernel.bind<ProvidersManager>("ProvidersManager")
            .to(ProvidersManager).inSingletonScope().onActivation(InversifyConfig._subscribe);

        InversifyConfig._kernel.bind<HtmlTypescriptCompletionItemProvider>("HtmlTypescriptCompletionItemProvider")
            .to(HtmlTypescriptCompletionItemProvider).inSingletonScope().onActivation(InversifyConfig._subscribe);

        // Services
        InversifyConfig._kernel.bind<ViewsControllersService>("ViewsControllersService")
            .to(ViewsControllersService).inSingletonScope().onActivation(InversifyConfig._subscribe);
        InversifyConfig._kernel.bind<TypescriptLanguageService>("TypescriptLanguageService")
            .to(TypescriptLanguageService).inSingletonScope().onActivation(InversifyConfig._subscribe);
        InversifyConfig._kernel.bind<TypescriptLanguageService2>("TypescriptLanguageService2")
            .to(TypescriptLanguageService2).inSingletonScope().onActivation(InversifyConfig._subscribe);

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
