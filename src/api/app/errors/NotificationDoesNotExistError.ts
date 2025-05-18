import APIError from "./APIError";

class NotificationDoesNotExistError extends APIError {
  constructor(userId: number, notificationId: number) {
    super(404, {
      message: "Invalid notification id",
      details: `user with id=${userId} does not have notification with id=${notificationId}`,
    });
  }
}

export default NotificationDoesNotExistError;
