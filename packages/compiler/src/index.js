"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileDsl = compileDsl;
const validator_1 = require("@lowcode/validator");
const transform_1 = require("./transform");
const package_1 = require("./package");
function compileDsl(dsl) {
    const validation = (0, validator_1.validateDsl)(dsl);
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
    const ir = (0, transform_1.transformDslToIr)(dsl);
    const output = (0, package_1.packageBuild)(ir);
    return {
        ok: true,
        output
    };
}
