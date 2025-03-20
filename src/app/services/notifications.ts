import User from "../models/user";
import { INotification } from "../schemas/database/notification";

export const getNotificationsByUserId = async (
  userId: number,
  size: number
): Promise<INotification[]> => {
  const user = await User.findById(userId, "notifications");
  if (!user) {
    throw new Error();
  }

  return user.notifications.slice(0, size);
};
