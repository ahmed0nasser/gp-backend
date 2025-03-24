import APIError from "../errors/APIError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import User from "../models/user";
import { INotification } from "../schemas/database/notification";

export const getNotificationsByUserId = async (
  userId: number,
  page: number,
  size: number
): Promise<INotification[]> => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const maxPageNum = getNotificationsPagesNum(user.notifications.length);
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

// ====================================
// HELPERS
// ====================================
const getNotificationsPagesNum = (len: number) => {
  return Math.ceil(len / 50);
};
