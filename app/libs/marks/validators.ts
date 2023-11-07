import Joi from "joi";

export const createRecipeMarkSchema = Joi.object({
    title: Joi.string().min(5).max(255),
    content: Joi.string().max(255),
    mark: Joi.number().required().min(1).max(5),
});