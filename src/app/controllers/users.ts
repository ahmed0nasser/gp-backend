import { RequestHandler, Request } from "express";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";
import { sendNotification } from "../services/notifications";
import { areRelated, sendRelationRequest } from "../services/relations";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";
import { getUserInfoById, getUserProfileById } from "../services/users";
import APIError from "../errors/APIError";

export const usersGetUserInfoController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    if (
      req.userClaim.id != Number(req.params.id) &&
      !(await areRelated(req.userClaim.id, Number(req.params.id)))
    ) {
      throw new APIError(403, {
        message: "Unauthorized access",
        details: "cannot get profile of userId=" + req.params.id,
      });
    }

    const userInfo = await getUserInfoById(Number(req.params.id));

    res.status(200).json({
      status: "success",
      data: userInfo,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const usersGetUserProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    if (
      req.userClaim.id != Number(req.params.id) &&
      !(await areRelated(req.userClaim.id, Number(req.params.id)))
    ) {
      throw new APIError(403, {
        message: "Unauthorized access",
        details: "cannot get profile of userId=" + req.params.id,
      });
    }

    const profile = await getUserProfileById(Number(req.params.id));

    res.status(200).json({
      status: "success",
      data: profile,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const usersGetVitalStatsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    const vitalStats = await getVitalStatsByUserId(
      Number(req.params.id),
      req.query.duration as Duration,
      req.query.limit ? Number(req.query.limit) : undefined
    );

    res.status(200).json({
      status: "success",
      data: {
        userId: Number(req.params.id),
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

export const usersPostRelationController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const relationId = await sendRelationRequest(
      Number(req.userClaim.id),
      Number(req.params.id)
    );

    res.status(201).json({
      status: "success",
      message: "Relation Request sent successfully",
      data: { relationId },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const usersPostNotificationController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const notificationId = await sendNotification(
      Number(req.userClaim.id),
      Number(req.params.id),
      req.body
    );

    res.status(201).json({
      status: "success",
      message: "Notification sent successfully",
      data: { notificationId },
    });
    return;
  } catch (error) {
    next(error);
  }
};
