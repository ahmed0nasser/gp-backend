import Joi from "joi";

const schema = Joi.object({
  firstName: Joi.string().pattern(new RegExp("^[A-Za-z]+$")).required(),
  lastName: Joi.string().pattern(new RegExp("^[A-Za-z]+$")).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^.{8,}$")).required(),
  repeatPassword: Joi.ref("password"),
  role: Joi.string().valid("caregiver", "ward"),
});

export default schema;
