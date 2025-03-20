import { Request, RequestHandler } from "express";
import { logoutUser } from "../../services/auth";

const logoutController: RequestHandler = async (req: Request, res) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }
    await logoutUser(req.userClaim.id);
    res.sendStatus(204);
    return;
  } catch (error) {}
};

export default logoutController;
