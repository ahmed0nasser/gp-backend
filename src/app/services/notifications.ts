import APIError from "../errors/APIError";
import NotificationDoesNotExistError from "../errors/NotificationDoesNotExistError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import { getNextSequence } from "../models/counter";
import User from "../models/user";
import { INotification } from "../schemas/database/notification";
import { areRelated } from "./relations";

export type NewNotification = Omit<
  INotification,
  "_id" | "senderId" | "isRead"
>;

export const getNotification = async (
  userId: number,
  notificationId: number
): Promise<INotification> => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const notification = user.notifications.find(
    (notification) => notification._id === notificationId
  );
  if (!notification) {
    throw new NotificationDoesNotExistError(userId, notificationId);
  }

  return notification;
};

export const getNotificationsByUserId = async (
  userId: number,
  page: number,
  size: number
): Promise<INotification[]> => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const maxPageNum = getNotificationsPagesNum(user.notifications.length) + 1;
  if (page > maxPageNum) {
    throw new APIError(400, {
      message: "Unavailable page number",
      details:
        "the supplied page number in the query is greater than the maximum number of pages: " +
        maxPageNum,
    });
  }
  const keys = [
    "type",
    "title",
    "body",
    "relatedUserId",
    "senderId",
    "isRead",
    "createdAt",
    "updatedAt",
  ];
  const pageIndex = (page - 1) * 50;
  const userNotifications = user.notifications
    .slice(pageIndex, pageIndex + size)
    .map((notification) => {
      const userNotification: any = {};
      userNotification.id = notification._id;
      for (let key of keys) {
        userNotification[key] = (notification as any)[key];
      }
      return userNotification;
    });

  return userNotifications;
};

export const sendNotification = async (
  senderId: number,
  receiverId: number,
  newNotification: NewNotification
): Promise<number> => {
  if (senderId != receiverId && !(await areRelated(senderId, receiverId))) {
    throw new APIError(403, {
      message: "Cannot send notification to unrelated user",
      details: `Sender with id=${senderId} is not related to receiver with id=${receiverId}`,
    });
  }
  if (
    senderId != newNotification.relatedUserId &&
    !(await areRelated(senderId, newNotification.relatedUserId))
  ) {
    throw new APIError(403, {
      message: "Cannot send notification to unrelated user",
      details: `Sender with id=${senderId} is not related to user with id=${newNotification.relatedUserId}`,
    });
  }
  if (
    receiverId != newNotification.relatedUserId &&
    !(await areRelated(receiverId, newNotification.relatedUserId))
  ) {
    throw new APIError(403, {
      message: "Cannot send notification to unrelated user",
      details: `Receiver with id=${receiverId} is not related to user with id=${newNotification.relatedUserId}`,
    });
  }

  const receiver = await User.findById(receiverId, "notifications");
  if (!receiver) {
    throw new UserDoesNotExistError(receiverId);
  }

  // Create notification
  const notificationId = await getNextSequence("notification");
  const notification: INotification = {
    _id: notificationId,
    senderId,
    isRead: false,
    ...newNotification,
  };

  // Store notification in DB
  receiver.notifications.push(notification);
  await receiver.save();

  return notificationId;
};

export const readNotifications = async (
  userId: number,
  notificationIds: number[]
) => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const notifications = notificationIds.map((notificationId) => {
    const notification = user.notifications.find(
      (notification) => notification._id === notificationId
    );
    if (!notification)
      throw new NotificationDoesNotExistError(userId, notificationId);
    return notification;
  });

  for (let notification of notifications) {
    notification.isRead = true;
  }

  await user.save();
};

export const deleteNotification = async (
  userId: number,
  notificationId: number
) => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const notificationIndex = user.notifications.findIndex(
    (notification) => notification._id === notificationId
  );
  if (notificationIndex === -1)
    throw new NotificationDoesNotExistError(userId, notificationId);

  user.notifications.splice(notificationIndex, 1);

  await user.save();
};

// ====================================
// HELPERS
// ====================================
const getNotificationsPagesNum = (len: number) => {
  return Math.ceil(len / 50);
};
