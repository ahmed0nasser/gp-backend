import User from "../models/user";

export type Duration = "30mins" | "hour" | "day" | "week";

export const getVitalStatsByUserId = async (userId: number, duration: Duration, limit: number ) => {
  const user = await User.findById(userId, "role vitalStats");
  if (!user) {
    throw new Error();
  }
  if (user.role !== "ward") {
    // no vital stats for caregivers
    throw new Error();
  }

  const durationTimestamp = durationToDate(duration);
  
  const userVitalStats = user.vitalStats.filter(vitalStat => vitalStat.timestamp.valueOf() - durationTimestamp >= 0);

  return userVitalStats.slice(0, limit);
}

const durationToDate = (duration: Duration) => {
  let date;

  switch(duration) {
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
}