import { NextFunction, Request, Response } from "express";
import { Schema } from "joi";

const validateRequestBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        error: {
          message: "Invalid Request",
          details: error.details[0].message,
        },
      });
    }
    next();
  };
};
