import Joi from "joi";

export const vitalStatsQuerySchema = Joi.object({
  duration: Joi.string().valid("hour", "day", "week").required(),
  limit: Joi.number().min(1).max(50),
}).unknown(false);
