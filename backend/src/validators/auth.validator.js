import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).matches(/[A-Z]/).withMessage("Must contain uppercase")
    .matches(/[0-9]/).withMessage("Must contain number"),
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

export const resetPasswordValidator = [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
];
