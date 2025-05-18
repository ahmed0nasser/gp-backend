import { Request, RequestHandler } from "express";
import { logoutUser } from "../../services/auth";
import UnableAuthenticateUserError from "../../errors/UnableAuthenticateUserError";

const logoutController: RequestHandler = async (req: Request, res, next) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }
    await logoutUser(req.userClaim.id);
    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};

export default logoutController;
