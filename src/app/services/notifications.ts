import APIError from "../errors/APIError";
import NotificationDoesNotExistError from "../errors/NotificationDoesNotExistError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import { getNextSequence } from "../models/counter";
import User from "../models/user";
import { INotification } from "../schemas/database/notification";
import { areRelated } from "./relations";

type NewNotification = Omit<INotification, "_id" | "sender" | "isRead">;

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

  return user.notifications.slice((page - 1) * 50, size);
};

export const sendNotification = async (
  senderId: number,
  receiverId: number,
  newNotification: NewNotification
): Promise<number> => {
  const receiver = await User.findById(receiverId, "notifications");
  if (!receiver) {
    throw new UserDoesNotExistError(receiverId);
  }

  if (!(await areRelated(senderId, receiverId))) {
    throw new APIError(403, {
      message: "Cannot send notification to unrelated user",
    });
  }

  // Create notification
  const notificationId = await getNextSequence("notification");
  const notification: INotification = {
    _id: notificationId,
    sender: "UserId_" + senderId,
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

// ====================================
// HELPERS
// ====================================
const getNotificationsPagesNum = (len: number) => {
  return Math.ceil(len / 50);
};
