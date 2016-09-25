// The MIT License (MIT)
// Copyright (c) 2016 David González Zornoza
import * as vsc from "vscode";

import { SeedEnvironmentConfig } from "./config";
import { InversifyConfig } from "./inversify.config";
import { IStatusBar } from "./components/statusBar.component";
import { ProvidersManager } from "./providers/providersManager";

import { activateTest } from "../external/typescript/src/typescriptMain";

// this method is called when extension is activated
// extension is activated the very first time the command is executed
export function activate(context: vsc.ExtensionContext): any {
    "use strict";

    // initialize angular-typescript-seed-extension only if is based in angular-typescript-seed project
    SeedEnvironmentConfig.initialize().then((result: boolean) => {
        let log: string = "angular-typescript-extension is " + (result ?  "activated" : "deactivated (not exists project)");
        console.log(log);

        // activate extension with IOC container
        if (result) {

            InversifyConfig.initialize(context);
            InversifyConfig.Kernel.get<IStatusBar>("IStatusBar");
            InversifyConfig.Kernel.get<ProvidersManager>("ProvidersManager");

            activateTest(context);
        }

    });

}

// this method is called when extension is deactivated
export function deactivate(): any {
    "use strict";
}
