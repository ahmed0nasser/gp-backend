import Joi from "joi";

const schema = Joi.object({
  status: Joi.string().valid("accepted", "rejected", "canceled").required(),
});

export default schema;
