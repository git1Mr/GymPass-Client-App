// app/validation/authSchemas.ts

import Joi, { Schema, ValidationErrorItem } from "joi";

// ── Schemas ──────────────────────────────────────────────────────────────────

export const loginSchema: Schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Saisissez une adresse e-mail valide.",
      "string.empty": "L'e-mail est requis.",
      "any.required": "L'e-mail est requis.",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Le mot de passe doit comporter au moins 8 caractères.",
    "string.empty": "Le mot de passe est requis.",
    "any.required": "Le mot de passe est requis.",
  }),
});

export const registerSchema: Schema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Le nom doit comporter au moins 2 caractères.",
    "string.empty": "Le nom complet est requis.",
    "any.required": "Le nom complet est requis.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Saisissez une adresse e-mail valide.",
      "string.empty": "L'e-mail est requis.",
      "any.required": "L'e-mail est requis.",
    }),
  password: Joi.string().min(8).max(1024).required().messages({
    "string.min": "Le mot de passe doit comporter au moins 8 caractères.",
    "string.empty": "Le mot de passe est requis.",
    "any.required": "Le mot de passe est requis.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Les mots de passe ne correspondent pas.",
    "string.empty": "Veuillez confirmer votre mot de passe.",
    "any.required": "Veuillez confirmer votre mot de passe.",
  }),
});

export const forgotSchema: Schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Saisissez une adresse e-mail valide.",
      "string.empty": "L'e-mail est requis.",
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
