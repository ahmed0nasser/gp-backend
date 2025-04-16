import Joi from "joi";

export const devicePairSchema = Joi.object({
  deviceId: Joi.string().required(),
}).unknown(false);
