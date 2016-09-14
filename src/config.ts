import * as vsc from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IResolve, IReject } from "./models/interfaces/common";
import { IKeyValueMap } from "./models/interfaces/common";

const MAIN_APP_REGEXP: RegExp = /[\s\S]*class AngularApp[\s\S]*\.controllersBasePath\s*=\s*"(.*)";[\s\S]*.viewsBasePath\s*=\s*"(.*)";[\s\S]*/;
const ROUTES_REGEXP: RegExp = /((controllerAs)\s*:\s*"((\\"|[^"])*)")|((path)\s*:\s*"((\\"|[^"])*)")/g;

/**
 * Clas with angular-typescript-seed environment vars
 */
export class SeedEnvironmentConfig {

    private static _isValidProject: boolean;
    private static _viewsBasePath: string;
    private static _controllersBasePath: string;
    private static _routes: IKeyValueMap<string>[];

    /** Initialize angular-typescript-seed-extension only if is based in angular-typescript-seed project
     * @return true if can activate extension (only if exists angular-typescript-seed project), false otherwise.
     */
    public static initialize(): Promise<boolean> {

        return new Promise((resolve: IResolve<boolean>, reject: IReject) => {

            if (!vsc.workspace.rootPath) {
                reject(false);
            }

            let tsRootFiles: string = "src/app/*.ts";

            vsc.workspace.findFiles(tsRootFiles, "").then((uris: vsc.Uri[]) => {

                let isInitialized: boolean = false;

                // loop angular-typescript-seed root files for verify if project is based in 'angular-typescript-seed project' and configure project vars.
                // use 'reduce' function for create secuential promises in workspace files
                let initializeAsync: Promise<boolean> = uris.reduce((previous: Promise<boolean>, current: vsc.Uri) => {
                    return previous.then((prevPromiseResult: boolean) => {
                        isInitialized = isInitialized || prevPromiseResult;
                        return SeedEnvironmentConfig.configureFromfile(current);
                    });
                },
                Promise.resolve(false));

                // resolve initialization
                initializeAsync.then((result: boolean) => {
                    resolve(isInitialized);
                });
            });

        });
    }

    /** Property for get if exists angular-typescript-seed project */
    public static get IsValidProject(): boolean {
        return SeedEnvironmentConfig._isValidProject;
    }
    /** Base path (normalized) for angular-typescript-seed views */
    public static get ViewBasePath(): string {
        return SeedEnvironmentConfig._viewsBasePath;
    }
    /** Base path (normalized) for angular-typescript-seed controllers */
    public static get ControllersBasePath(): string {
        return SeedEnvironmentConfig._controllersBasePath;
    }
    public static get Routes(): IKeyValueMap<string>[] {
        return SeedEnvironmentConfig._routes;
    }


    private static configureFromfile(uri: vsc.Uri): Promise<boolean> {

var re = /((controllerAs)\s*:\s*"((\\"|[^"])*)")|((path)\s*:\s*"((\\"|[^"])*)")/g;
var str = 'import { IRouteResolverProvider } from "app/services/routeResolver.provider";\n\nexport class RoutesConfig {\n\n    /** Function for initialize app routes */\n    public static initialize(routeProvider: ng.route.IRouteProvider, routeResolverProvider: IRouteResolverProvider): void {\n\n        // DEFAULT\n        routeProvider.otherwise({ redirectTo: "/home" });\n\n        // MAIN ROUTES\n        routeProvider.when("/about", routeResolverProvider.resolve({ controllerAs:  "vm", path: "about ff" }));\n        routeProvider.when("/contact", routeResolverProvider.resolve({  path: "contact", controllerAs: "vm" }));\n        routeProvider.when("/contact", routeResolverProvider.resolve({  controllerAs:"asdf", path: "contact", controllerAs: "vm" }));\n        routeProvider.when("/home", routeResolverProvider.resolve({ a: 5,   controllerAs:   "vm", path: "home", e: "sdf" }));\n        routeProvider.when("/users", routeResolverProvider.resolve({ a:  "asdf",controllerAs: "vm", r: "sdf", path: "home", e: "sdf" }));\n\n    }\n}\n(controllerAs|path)\s*:\s*"((\\"|[^"])*)"\n\n(controllerAs|path)":"((\\"|[^"])*)\n\n\n[\s\S]*class RoutesConfig[\s\S]*\.when.*resolve\(.*(controllerAs|path).*\).*\n\nresolve\(.*(controllerAs|path)"*:\s*"((\\"|[^"])*)".*\)\n\n(controllerAs|path)"*:\s*"(([^"])*)"\n\n(controllerAs\s*:\s*"((\\"|[^"])*)")|(path\s*:\s*"((\\"|[^"])*)")';
var m;

while ((m = re.exec(str)) !== null) {
    if (m.index === re.lastIndex) {
        re.lastIndex++;
    }
    // View your result using the m-variable.
    // eg m[0] etc.
}



        return new Promise((resolve: IResolve<boolean>, reject: IReject) => {

            fs.readFile(uri.fsPath, "utf8", (err: any, data: string) => {
                if (err) { reject(err); }


                let mainAppMatches: RegExpExecArray = MAIN_APP_REGEXP.exec(data);
                let routesMatches: RegExpExecArray = ROUTES_REGEXP.exec(data);

                // main app file
                if (mainAppMatches != undefined && mainAppMatches.length === 3) {
                    SeedEnvironmentConfig._controllersBasePath = path.normalize(mainAppMatches[1]);
                    SeedEnvironmentConfig._viewsBasePath = path.normalize(mainAppMatches[2]);
                    return resolve(true);

                // routes file
                } else if (routesMatches != undefined) {

                    while (routesMatches != null) {
                        // matched text: match[0]
                        // match start: match.index
                        // capturing group n: match[n]
                        routesMatches = ROUTES_REGEXP.exec(data);
                        }


                // nothing
                } else {
                    return resolve(false);
                }

            });
        });
    }
}

