import Joi from "joi";

const schema = Joi.object({
  firstName: Joi.string().pattern(new RegExp("^[A-Za-z\\s-]+$")).required(),
  lastName: Joi.string().pattern(new RegExp("^[A-Za-z\\s-]+$")).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^.{8,}$")).required(),
  repeatPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "repeatPassword must match password",
  }),
  role: Joi.string().valid("caregiver", "ward").required(),
});

export default schema;
