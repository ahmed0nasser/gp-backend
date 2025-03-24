import APIError from "../errors/APIError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import User from "../models/user";

export type Duration = "30mins" | "hour" | "day" | "week";

export const getVitalStatsByUserId = async (
  userId: number,
  duration: Duration,
  limit?: number
) => {
  const user = await User.findById(userId, "role vitalStats");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }
  if (user.role !== "ward") {
    throw new APIError(403, { message: "No vital stats for non-ward users" });
  }

  const durationTimestamp = durationToDate(duration);

  const userVitalStats = user.vitalStats.filter(
    (vitalStat) => vitalStat.timestamp.valueOf() >= durationTimestamp
  );

  return limit ? userVitalStats.slice(0, limit) : userVitalStats;
};

// ====================================
// HELPERS
// ====================================
const durationToDate = (duration: Duration) => {
  let date;

  switch (duration) {
    case "30mins":
      date = 1800000;
      break;
    case "hour":
      date = 3600000;
      break;
    case "day":
      date = 86400000;
      break;
    case "week":
      date = 604800000;
      break;
  }

  return Date.now() - date;
};
