import request from "supertest";
import app from "../../app/app";

export const deleteNotification = async (
  userAccessToken: string,
  notificationId: number
) => {
  await request(app)
    .delete(`/notifications/${notificationId}`)
    .auth(userAccessToken, { type: "bearer" });
};

export const getNotifications = async (userAccessToken: string) => {
  const {
    body: {
      data: { notifications },
    },
  } = await request(app)
    .get(`/notifications?page=1&size=50`)
    .auth(userAccessToken, { type: "bearer" });

  return notifications;
};
