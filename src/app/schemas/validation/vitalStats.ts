import Joi from "joi";

export const vitalStatSchema = Joi.object({});

export const vitalStatsQuerySchema = Joi.object({
  duration: Joi.string().valid("30mins", "hour", "day", "week").required(),
  limit: Joi.number().required().min(1).max(50),
});
