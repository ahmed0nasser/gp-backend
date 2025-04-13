import Joi from "joi";

export const notificationSchema = Joi.object({
  type: Joi.string()
    .valid("emergency", "warning", "schedule", "normal")
    .required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
}).unknown(false);

export const notificationReadSchema = Joi.object({
  ids: Joi.array().items(Joi.number().greater(0)).min(1).max(50).required(),
  isRead: Joi.boolean().valid(true).required(),
}).unknown(false);

export const notificationsQuerySchema = Joi.object({
  page: Joi.number().required().min(1),
  size: Joi.number().required().min(1).max(50),
}).unknown(false);
