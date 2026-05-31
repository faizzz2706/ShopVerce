import { validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError("Validation failed", 400, errors.array())
    );
  }
  next();
}
