import User from "../models/user";
import { INotification } from "../schemas/database/notification";

export const getNotificationsByUserId = async (
  userId: number,
  page: number,
  size: number
): Promise<INotification[]> => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new Error();
  }
  const pagesNum = getNotificationsPagesNum(user.notifications.length);
  if (page > pagesNum) {
    throw new Error();
  }
  
  return user.notifications.slice((page - 1) * 50, size);
};

// ====================================
// HELPERS
// ====================================
const getNotificationsPagesNum = (len: number) => {
  return Math.ceil(len / 50);
}