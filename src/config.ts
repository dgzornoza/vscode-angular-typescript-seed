import * as vsc from "vscode";
import * as fs from "fs";
import { IResolve, IReject } from "./models/interfaces/common.d";

const MAIN_APP_REGEXP: RegExp = /[\s\S]*class AngularApp[\s\S]*\.controllersBasePath\s*=\s*"(.*)";[\s\S]*.viewsBasePath\s*=\s*"(.*)";[\s\S]*/;


/**
 * Clas with angular-typescript-seed environment vars
 */
export class SeedEnvironmentConfig {

    private static _isValidProject: boolean;
    private static _viewsBasePath: string;
    private static _controllersBasePath: string;


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
    /** Base path for angular-typescript-seed views */
    public static get ViewBasePath(): string {
        return SeedEnvironmentConfig._viewsBasePath;
    }
    /** Base path for angular-typescript-seed controllers */
    public static get ControllersBasePath(): string {
        return SeedEnvironmentConfig._controllersBasePath;
    }



    private static configureFromfile(uri: vsc.Uri): Promise<boolean> {

        return new Promise((resolve: IResolve<boolean>, reject: IReject) => {

            fs.readFile(uri.fsPath, "utf8", (err: any, data: string) => {
                if (err) { reject(err); }

                let matches: RegExpExecArray = MAIN_APP_REGEXP.exec(data);
                if (matches != undefined && matches.length === 3) {
                    SeedEnvironmentConfig._controllersBasePath = matches[1];
                    SeedEnvironmentConfig._viewsBasePath = matches[2];
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
    }
}
