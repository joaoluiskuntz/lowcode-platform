export interface ValidationIssue {
    path: string;
    message: string;
    severity: "error" | "warning";
    code: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
}
export declare function validateDsl(input: unknown): ValidationResult;
