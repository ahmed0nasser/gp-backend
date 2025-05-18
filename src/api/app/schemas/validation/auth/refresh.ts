import Joi from "joi";

const schema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(false);

export default schema;
