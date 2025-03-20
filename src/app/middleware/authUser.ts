import { Request, RequestHandler } from "express";
import { authUser, UserClaim } from "../services/auth";

const authUserHandler: RequestHandler = async (req: Request, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res
      .status(401)
      .json({ status: "error", error: { message: "Unauthorized access" } });
    return;
  }
  try {
    const userClaim = (await authUser(token as string)) as UserClaim;
    req.userClaim = userClaim;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", error: { message: "Unauthorized access" } });
    return;
  }
};

export default authUserHandler;
