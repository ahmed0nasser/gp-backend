import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^.{8,}$")).required(),
});

export default schema;
