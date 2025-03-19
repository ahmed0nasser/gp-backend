import Joi from "joi";

const schema = Joi.object({
  refreshToken: Joi.string().valid("caregiver", "ward"),
});

export default schema;
