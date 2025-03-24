import { RequestHandler } from "express";
import { loginUser } from "../../services/auth";

const loginController: RequestHandler = async (req, res, next) => {
  try {
    const tokens = await loginUser(req.body);
    res
      .status(200)
      .json({ status: "success", message: "Successful login", data: tokens });
      return;
  } catch (error) {
    next(error);
  }
};

export default loginController;
