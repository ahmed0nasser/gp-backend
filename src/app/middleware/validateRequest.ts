import { RequestHandler } from "express";
import { Schema } from "joi";

type validationType = "body" | "query" | "params";

export const validateRequest = (
  type: validationType,
  schema: Schema
): RequestHandler => {
  return (req, res, next) => {
    const errorMessage = {
      body: "Invalid Request body",
      query: "Invalid URL query parameters",
      params: "Invalid Request URL",
    };
    let result;
    switch (type) {
      case "body":
        result = schema.validate(req.body);
        break;
      case "query":
        result = schema.validate(req.query);
        break;
      case "params":
        result = schema.validate(req.params);
        break;
    }
    if (result.error) {
      res.status(400).json({
        status: "error",
        error: {
          message: errorMessage[type],
          details: result.error.details[0].message,
        },
      });
      return;
    }
    next();
  };
};
