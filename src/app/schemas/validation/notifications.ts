import Joi from "joi";

export const notificationSchema = Joi.object({
  type: Joi.string()
    .valid("emergency", "warning", "schedule", "normal")
    .required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});

export const notificationsQuerySchema = Joi.object({
  size: Joi.number().required().min(1).max(50),
});
