import Joi from "joi";

export const schema = Joi.object({
  temperature: Joi.number().required(),
  heartRate: Joi.number().required(),
  bloodOxygen: Joi.number().required(),
}).unknown(false);

export default schema;
