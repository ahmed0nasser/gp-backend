import { RequestHandler, Request } from "express";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";
import {
  deleteNotification,
  getNotification,
  readNotifications,
} from "../services/notifications";

export const notificationsReadController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await readNotifications(Number(req.userClaim.id), req.body.ids);

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};

export const notificationFetchController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const notification = await getNotification(
      Number(req.userClaim.id),
      Number(req.params.id)
    );

    res.status(200).json({
      status: "success",
      data: notification,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const notificationDeleteController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await deleteNotification(Number(req.userClaim.id), Number(req.params.id));

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};
