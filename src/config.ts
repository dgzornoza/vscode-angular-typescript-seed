import * as vsc from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IResolve, IReject } from "./models/interfaces/common";
import { IKeyValueMap } from "./models/interfaces/common";

const MAIN_APP_REGEXP: RegExp = /[\s\S]*class AngularApp[\s\S]*\.controllersBasePath\s*=\s*"(.*)";[\s\S]*.viewsBasePath\s*=\s*"(.*)";[\s\S]*/;
const ROUTES_ALIAS_REGEXP: RegExp =
    /controllerAs\s*:\s*"((\\"|[^"])*)".*path\s*:\s*"((\\"|[^"])*)"|path\s*:\s*"((\\"|[^"])*)".*controllerAs\s*:\s*"((\\"|[^"])*)"/g;

/**
 * Clas with angular-typescript-seed environment vars
 */
export class SeedEnvironmentConfig {

    private static _isValidProject: boolean;
    private static _viewsBasePath: string;
    private static _controllersBasePath: string;
    private static _routesAlias: IKeyValueMap<string>;

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
    public static get RoutesAlias(): IKeyValueMap<string> {
        return SeedEnvironmentConfig._routesAlias;
    }


    private static configureFromfile(uri: vsc.Uri): Promise<boolean> {

        return new Promise((resolve: IResolve<boolean>, reject: IReject) => {

            fs.readFile(uri.fsPath, "utf8", (err: any, data: string) => {
                if (err) { reject(err); }

                let mainAppMatches: RegExpExecArray = MAIN_APP_REGEXP.exec(data);
                let routesMatches: RegExpExecArray = ROUTES_ALIAS_REGEXP.exec(data);

                // main app file
                if (mainAppMatches != undefined && mainAppMatches.length === 3) {
                    SeedEnvironmentConfig._controllersBasePath = path.normalize(mainAppMatches[1]);
                    SeedEnvironmentConfig._viewsBasePath = path.normalize(mainAppMatches[2]);
                    return resolve(true);

                // routes file
                } else if (routesMatches != undefined) {

                    this._routesAlias = {};

                    do {
                        // store routes alias from regex
                        let routeMatch: string = routesMatches[3] || routesMatches[5];
                        this._routesAlias[path.normalize(routeMatch)] = routesMatches[1] || routesMatches[7];

                        if (routesMatches.index === ROUTES_ALIAS_REGEXP.lastIndex) {
                            ROUTES_ALIAS_REGEXP.lastIndex++;
                        }
                        routesMatches = ROUTES_ALIAS_REGEXP.exec(data);
                    } while (routesMatches)

                    return resolve(true);

                // nothing
                } else {
                    return resolve(false);
                }

            });
        });
    }
}

