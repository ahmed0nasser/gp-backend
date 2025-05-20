import { VitalData, SystemNotification } from "../interfaces";
import UserDoesNotExistError from "../../api/app/errors/UserDoesNotExistError";
import User from "../../api/app/models/user";
import clients from "../clients";
import { getNextSequence } from "../../api/app/models/counter";

export default async function handleNotifyingCaregivers(
  data: VitalData,
  clientId: string
) {
  const notifications = checkVitals(data);
  if (notifications.length == 0) return;

  const client = clients.get(clientId)!;
  const userId = Number(client.userId);
  const user = await User.findById(userId, "relations");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }
  user.relations.forEach(async (r) => {
    const caregiver = await User.findById(r.relatedUserId, "notifications");
    if (!caregiver) {
      throw new UserDoesNotExistError(r.relatedUserId);
    }
    if (caregiver.role !== "caregiver") return;

    for (let notification of notifications) {
      const nId = await getNextSequence("notification");
      caregiver.notifications.push({
        _id: nId,
        senderId: 0,
        relatedUserId: userId,
        isRead: false,
        ...notification,
      });
    }
    console.log(
      "sends notifications:",
      notifications,
      " to caregiver with id=",
      caregiver._id
    );
    await caregiver.save();
  });
  user.vitalStats.push({ timestamp: new Date(), ...data });
  await user.save();
}

// Helper
function checkVitals(data: VitalData): SystemNotification[] {
  const notifications: SystemNotification[] = [];

  // Temperature checks
  if (data.temperature > 39 || data.temperature < 36) {
    notifications.push({
      type: data.temperature > 39 ? "emergency" : "warning",
      title: `Temperature ${data.temperature}°C`,
      body: `Patient's temperature is ${
        data.temperature > 39 ? "high" : "low"
      }. Patient needs your consultation.`,
    });
  } else if (data.temperature > 37.5) {
    notifications.push({
      type: "warning",
      title: `Temperature ${data.temperature}°C`,
      body: "Patient's temperature is slightly elevated. Monitor patient's condition.",
    });
  }

  // Heart Rate checks (assuming typical adult resting heart rate 60-100 bpm)
  if (data.heartRate > 120 || data.heartRate < 40) {
    notifications.push({
      type: "emergency",
      title: `Heart Rate ${data.heartRate} bpm`,
      body: `Patient's heart rate is dangerously ${
        data.heartRate > 120 ? "high" : "low"
      }. Patient needs your immediate medical attention.`,
    });
  } else if (data.heartRate > 100 || data.heartRate < 50) {
    notifications.push({
      type: "warning",
      title: `Heart Rate ${data.heartRate} bpm`,
      body: `Patient's heart rate is slightly ${
        data.heartRate > 100 ? "high" : "low"
      }. Monitor patient's condition.`,
    });
  }

  // Blood Oxygen checks (SpO2, normal range typically 95-100%)
  if (data.bloodOxygen < 90) {
    notifications.push({
      type: "emergency",
      title: `Blood Oxygen ${data.bloodOxygen}%`,
      body: "Patient's blood oxygen level is critically low. Patient needs your immediate medical attention.",
    });
  } else if (data.bloodOxygen < 93) {
    notifications.push({
      type: "warning",
      title: `Blood Oxygen ${data.bloodOxygen}%`,
      body: "Patient's blood oxygen level is slightly low. Monitor patient's breathing.",
    });
  }

  return notifications;
}
