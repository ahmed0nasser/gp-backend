import Joi from "joi";

const schema = Joi.object({
  accessToken: Joi.string().required(),
}).unknown(false);

export default schema;
