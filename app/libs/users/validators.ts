import Joi from "joi";

export const passwordError = 'Password must contains at least an uppercase, a lowercase and a number and be a minimum of 8 caracters';
export const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

export const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().max(255).required(),
    password: Joi.string().required().regex(passwordRegex).messages({
        'string.pattern.base': passwordError,
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().regex(passwordRegex).messages({
        'string.pattern.base': passwordError,
    }),
});

