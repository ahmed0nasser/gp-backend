import { Request, RequestHandler } from "express";
import {
  changeUserProfile,
  getUserInfoById,
  getUserProfileById,
} from "../services/users";
import { getRelationsByUserId } from "../services/relations";
import { getNotificationsByUserId } from "../services/notifications";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";

export const meInfoController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const userInfo = await getUserInfoById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userInfo });
    return;
  } catch (error) {
    next(error);
  }
};

export const meRelationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const relations = await getRelationsByUserId(req.userClaim.id);

    res.status(200).json({ status: "success", data: relations });
    return;
  } catch (error) {
    next(error);
  }
};

export const meProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const userProfile = await getUserProfileById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userProfile });
    return;
  } catch (error) {
    next(error);
  }
};

export const meChangeProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await changeUserProfile(req.userClaim.id, req.body);

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};

export const meNotificationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const notifications = await getNotificationsByUserId(
      req.userClaim.id,
      Number(req.query.page),
      Number(req.query.size)
    );

    res.status(200).json({
      status: "success",
      data: { size: notifications.length, notifications },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const meVitalStatsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const vitalStats = await getVitalStatsByUserId(
      req.userClaim.id,
      req.query.duration as Duration,
      req.query.limit ? Number(req.query.limit) : undefined
    );

    res.status(200).json({
      status: "success",
      data: {
        userId: req.userClaim.id,
        size: vitalStats.length,
        duration: req.query.duration,
        vitalStats,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};
