import { Schema } from "mongoose";

type NotificationType = "emergency" | "warning" | "schedule" | "normal";

export interface INotification {
  _id: number;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  sender: string;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>({
  _id: { type: Number, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Date, default: Date.now() },
  sender: String,
  isRead: { type: Boolean, default: false },
});

export default notificationSchema;
