import { ErrorRequestHandler } from "express";
import APIError from "../errors/APIError";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof APIError) {
    res.status(err.statusCode).json({ status: "error", error: err.errRes });
  } else {
    res
      .status(500)
      .json({ status: "error", error: { name: err.name, ...err } });
  }
};

export default errorHandler;
