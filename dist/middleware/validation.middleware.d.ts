import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validate: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    id: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    pagination: z.ZodObject<{
        page: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        sortBy?: string | undefined;
    }, {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    dateRange: z.ZodEffects<z.ZodObject<{
        fechaDesde: z.ZodOptional<z.ZodString>;
        fechaHasta: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }, {
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }>, {
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }, {
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }>;
};
//# sourceMappingURL=validation.middleware.d.ts.map