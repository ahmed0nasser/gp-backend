import APIError from "../errors/APIError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import User from "../models/user";

export const pairDevice = async (userId: number, deviceId: string) => {
  const user = await User.findById(userId, "deviceId");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  if (user.role !== "ward") {
    throw new APIError(403, {
      message: "Cannot assign deviceId",
      details: `user with id=${userId} has inappropriate role`,
    });
  }

  user.deviceId = deviceId;

  await user.save();
};

export const unpairDevice = async (userId: number) => {
  const user = await User.findById(userId, "deviceId");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  if (user.role !== "ward") {
    throw new APIError(403, {
      message: "Cannot deassign deviceId",
      details: `user with id=${userId} has inappropriate role`,
    });
  }

  user.deviceId = "";

  await user.save();
};
