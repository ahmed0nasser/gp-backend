import { RequestHandler, Request } from "express";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";
import { getNotificationsByUserId } from "../services/notifications";
import { sendRelationRequest } from "../services/relations";

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
  } catch (error) {}
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
      Number(req.query.limit)
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
  } catch (error) {}
};

export const usersPostRelationController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      // internal server error
      throw new Error();
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
  } catch (error) {}
};
