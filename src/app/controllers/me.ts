import { Request, RequestHandler } from "express";
import { getUserInfoById, getUserProfileById } from "../services/users";
import { getRelationsByUserId } from "../services/relations";
import { getNotificationsByUserId } from "../services/notifications";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";

export const userInfoController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }

    const userInfo = await getUserInfoById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userInfo });
    return;
  } catch (error) {}
};

export const userRelationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }

    const relations = await getRelationsByUserId(req.userClaim.id);

    res.status(200).json({ status: "success", data: relations });
    return;
  } catch (error) {}
};

export const userProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }

    const userProfile = await getUserProfileById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userProfile });
    return;
  } catch (error) {}
};

export const userNotificationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }

    const notifications = await getNotificationsByUserId(
      req.userClaim.id,
      Number(req.query.size)
    );

    res
      .status(200)
      .json({
        status: "success",
        data: { size: Number(req.query.size), notifications },
      });
    return;
  } catch (error) {}
};

export const userVitalStatsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
    }

    const vitalStats = await getVitalStatsByUserId(req.userClaim.id, req.query.duration as Duration, Number(req.query.limit));

    res
      .status(200)
      .json({
        status: "success",
        data: {
          userId: req.userClaim.id,
          size: vitalStats.length,
          duration: req.query.duration,
          vitalStats,
        },
      });
    return;
  } catch (error) {}
};
