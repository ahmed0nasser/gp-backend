import { RequestHandler } from "express";
import { Schema, ValidationError } from "joi";
import APIError from "../errors/APIError";

type validationType = "body" | "query" | "params";

export const validateRequest = (
  type: validationType,
  schema: Schema
): RequestHandler => {
  return async (req, res, next) => {
    const errorMessage = {
      body: "Invalid Request body",
      query: "Invalid URL query parameters",
      params: "Invalid Request URL",
    };

    try {
      switch (type) {
        case "body":
          await schema.validateAsync(req.body);
          break;
        case "query":
          await schema.validateAsync(req.query);
          break;
        case "params":
          await schema.validateAsync(req.params);
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(
          new APIError(400, {
            message: errorMessage[type],
            details: error.details[0].message,
          })
        );
      } else {
        next(error);
      }
    }
  };
};
