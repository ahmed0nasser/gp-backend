import { RequestHandler } from "express";
import { registerNewUser } from "../../services/auth";

const registerController: RequestHandler = async (req, res, next) => {
  try {
    const userId = await registerNewUser(req.body);
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        userId,
      },
    });
    return;
  } catch (error) {
    // handle errror
  }
};

export default registerController;
