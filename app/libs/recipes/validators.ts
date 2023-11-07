import Joi from "joi";

export const createRecipeSchema = Joi.object({
    title: Joi.string().required().min(5).max(255),
    ingredients: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required().max(255),
                quantity: Joi.string().required().max(255),
            })
        )
        .required(),
    steps: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required().max(255),
                description: Joi.string().required(),
            })
        )
        .required(),
});