import Joi from "joi";

export const profileChangeSchema = Joi.object({
  firstName: Joi.string().pattern(new RegExp("^[A-Za-z\\s-]+$")),
  lastName: Joi.string().pattern(new RegExp("^[A-Za-z\\s-]+$")),
  title: Joi.string(),
  phoneNumber: Joi.string(),
  organization: Joi.string(),
  impairment: Joi.string(),
}).unknown(false);
