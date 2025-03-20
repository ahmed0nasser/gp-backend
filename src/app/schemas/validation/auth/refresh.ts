import Joi from "joi";

const schema = Joi.object({
  refreshToken: Joi.string().required(),
});

export default schema;
