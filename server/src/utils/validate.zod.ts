import { z } from "zod";
import { Request, Response, NextFunction } from "express";
type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }>
) => (req: Request, res: Response, next: NextFunction) => void;

const validateInput: ValidateInput = (schema) => (req, res, next) => {
  // Validate the input
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  console.log(result.error?.message);

  // If the validation fails, return a 400 status with the validation errors
  if (!result.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: result.error.message,
    });
  }

  // Call the next middleware or route handler
  next();
};

export { validateInput as validate };
