import Joi from "joi";

export const idParamsSchema = Joi.object({
  id: Joi.number().required().greater(0),
});
