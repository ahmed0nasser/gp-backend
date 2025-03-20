import { RequestHandler } from "express";
import { loginUser } from "../../services/auth";

const loginController: RequestHandler = async (req, res) => {
  try {
    const tokens = await loginUser(req.body);
    res
      .status(200)
      .json({ status: "success", message: "Successful login", data: tokens });
      return;
  } catch (error) {

  }
};

export default loginController;
