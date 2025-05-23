import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().pattern(new RegExp("^.{8,}$")).required(),
}).unknown(false);

export default schema;
