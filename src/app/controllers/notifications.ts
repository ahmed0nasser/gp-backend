import { RequestHandler, Request } from "express";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";
import {
  deleteNotification,
  getNotification,
  getNotificationsByUserId,
  readNotifications,
  readOneNotification,
} from "../services/notifications";

export const notificationsFetchController =
  (user: "me" | "user"): RequestHandler =>
  async (req: Request, res, next) => {
    try {
      if (!req.userClaim) {
        throw new UnableAuthenticateUserError();
      }

      const { total, notifications } = await getNotificationsByUserId(
        Number(user === "me" ? req.userClaim.id : req.params.id),
        Number(req.query.page),
        Number(req.query.size)
      );

      res.status(200).json({
        status: "success",
        data: { total, size: notifications.length, notifications },
      });
      return;
    } catch (error) {
      next(error);
    }
  };

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

export const notificationReadOneController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await readOneNotification(Number(req.userClaim.id), Number(req.params.id));

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};
export const notificationFetchOneController: RequestHandler = async (
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
