import { injectable } from "inversify";
import "reflect-metadata";

import { Disposable } from "./../models/disposable";
import { SeedEnvironmentConfig } from "./../config";

/**
 * Service for manage angular-typescript-seed Views/Controllers
 */
@injectable()
export class ViewsControllersService extends Disposable {

    constructor() {
        super();
    }

    /** Function for obtain normalized view path from normalized controller path
     * @param normalized controllerPath controller path for obtain related view path
     * @return normalized view path related
     */
    public getViewFromControllerPath(controllerPath: string): string {

        let viewPath: string = controllerPath.replace(SeedEnvironmentConfig.ControllersBasePath, SeedEnvironmentConfig.ViewBasePath);
        viewPath = viewPath.replace(".controller.ts", ".html");
        return viewPath;
    }

    /** Function for obtain normalized controller path from normalized view path
     * @param normalized viewPath view path for obtain related controller path
     * @return normalized controller path related
     */
    public getControllerFromViewPath(normalizedViewPath: string): string {

        let controllerPath: string = normalizedViewPath.replace(SeedEnvironmentConfig.ViewBasePath, SeedEnvironmentConfig.ControllersBasePath);
        controllerPath = controllerPath.replace(".html", ".controller.ts");
        return controllerPath;
    }

    /** Function for obtain controller class name from normalized path
     * @param normalizedPath normalized controller path
     * @return controller name
     */
    public getControllerClassNameFromPath(normalizedPath: string): string {
         return normalizedPath.split("/").pop().replace("controller.js", "");
    }

    public dispose(): void {
        // not used
    }
}
