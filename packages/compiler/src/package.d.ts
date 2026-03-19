import { AppIr } from "@lowcode/ir";
export interface BuildManifest {
    appId: string;
    version: string;
    generatedAt: string;
    targets: string[];
    contentHash: string;
}
export interface BuildOutput {
    manifest: BuildManifest;
    web: {
        ir: AppIr;
        entry: string;
    };
    android: {
        ir: AppIr;
        entry: string;
    };
}
export declare function packageBuild(ir: AppIr): BuildOutput;
