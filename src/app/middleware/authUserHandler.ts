import { Request, RequestHandler } from "express";
import { authUser } from "../services/auth";
import APIError from "../errors/APIError";

const authUserHandler: RequestHandler = async (req: Request, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw new APIError(401, {
        message: "Unauthorized access",
        details: "token is not provided in Authorization header",
      });
    }

    req.userClaim = await authUser(token as string);;

    next();
  } catch (error) {
    next(error);
  }
};

export default authUserHandler;
