import Joi from "joi";

const userClaimSchema = Joi.object({
  id: Joi.number().required().greater(0),
  role: Joi.string().valid("caregiver", "ward").required(),
}).unknown(false);

export default userClaimSchema;
