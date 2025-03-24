import Joi from "joi";

export const relationStatusSchema = Joi.object({
  status: Joi.string().valid("accepted", "rejected", "canceled").required(),
}).unknown(false);
