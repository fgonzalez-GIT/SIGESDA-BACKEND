export declare class NotFoundError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string);
}
export declare class ValidationError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string);
}
export declare class ConflictError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map