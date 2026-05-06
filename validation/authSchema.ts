// app/validation/authSchemas.ts

import Joi, { Schema, ValidationErrorItem } from "joi";

// ── Schemas ──────────────────────────────────────────────────────────────────

export const loginSchema: Schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters.",
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

export const registerSchema: Schema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters.",
    "string.empty": "Full name is required.",
    "any.required": "Full name is required.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is required.",
    }),
  password: Joi.string().min(8).max(1024).required().messages({
    "string.min": "Password must be at least 8 characters.",
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
    "string.empty": "Please confirm your password.",
    "any.required": "Please confirm your password.",
  }),
});

export const forgotSchema: Schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
    }),
});

// ── Helper ───────────────────────────────────────────────────────────────────

/** Returns a flat { fieldName: errorMessage } map, or null when valid. */
export function validate(
  schema: Schema,
  data: Record<string, unknown>,
): Record<string, string> | null {
  const { error } = schema.validate(data, { abortEarly: false });
  if (!error) return null;

  return error.details.reduce<Record<string, string>>(
    (acc: Record<string, string>, detail: ValidationErrorItem) => {
      const key = String(detail.path[0]);
      if (!acc[key]) acc[key] = detail.message;
      return acc;
    },
    {},
  );
}
