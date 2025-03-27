import { RequestHandler, Request } from "express";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";
import { getNotificationsByUserId } from "../services/notifications";
import { sendRelationRequest } from "../services/relations";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";

export const usersGetNotificationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    const notifications = await getNotificationsByUserId(
      Number(req.params.id),
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
