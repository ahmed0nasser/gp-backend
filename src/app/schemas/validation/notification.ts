import Joi from "joi";

const schema = Joi.object({
  type: Joi.string()
    .valid("emergency", "warning", "schedule", "normal")
    .required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});

export default schema;
