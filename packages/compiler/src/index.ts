import { LowCodeDsl } from "@lowcode/dsl-schema";
import { validateDsl } from "@lowcode/validator";
import { transformDslToIr } from "./transform";
import { packageBuild, BuildOutput } from "./package";
export { stableStringify } from "./stableJson";

export interface CompileResult {
  ok: boolean;
  output?: BuildOutput;
  errors?: { path: string; message: string; code: string }[];
}

export function compileDsl(dsl: LowCodeDsl): CompileResult {
  const validation = validateDsl(dsl);

  if (!validation.valid) {
    return {
      ok: false,
      errors: validation.issues
        .filter((i) => i.severity === "error")
        .map((i) => ({
          path: i.path,
          message: i.message,
          code: i.code
        }))
    };
  }

  const ir = transformDslToIr(dsl);
  const output = packageBuild(ir);

  return {
    ok: true,
    output
  };
}
