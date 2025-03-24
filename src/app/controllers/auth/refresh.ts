import { RequestHandler } from "express";
import { refreshUserAccessToken } from "../../services/auth";

const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const newAccessToken = await refreshUserAccessToken(req.body.refreshToken);
    res
      .status(200)
      .json({
        status: "success",
        message: "Successful access refresh",
        data: { accessToken: newAccessToken },
      });
    return;
  } catch (error) {
    next(error);
  }
};

export default refreshController;
