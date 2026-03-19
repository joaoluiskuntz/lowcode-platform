import { LowCodeDsl } from "@lowcode/dsl-schema";
import { BuildOutput } from "./package";
export { stableStringify } from "./stableJson";
export interface CompileResult {
    ok: boolean;
    output?: BuildOutput;
    errors?: {
        path: string;
        message: string;
        code: string;
    }[];
}
export declare function compileDsl(dsl: LowCodeDsl): CompileResult;
