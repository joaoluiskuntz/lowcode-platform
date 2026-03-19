"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageBuild = packageBuild;
const node_crypto_1 = __importDefault(require("node:crypto"));
const stableJson_1 = require("./stableJson");
function packageBuild(ir) {
    const canonicalIr = (0, stableJson_1.stableStringify)(ir);
    const contentHash = sha256(canonicalIr);
    const manifest = {
        appId: ir.app.id,
        version: ir.version,
        generatedAt: "1970-01-01T00:00:00.000Z",
        targets: ["web", "android"],
        contentHash
    };
    return {
        manifest,
        web: {
            ir,
            entry: "main.web.json"
        },
        android: {
            ir,
            entry: "main.android.json"
        }
    };
}
function sha256(value) {
    return node_crypto_1.default.createHash("sha256").update(value).digest("hex");
}
