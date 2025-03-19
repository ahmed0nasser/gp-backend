import { Schema } from "mongoose";
import relationSchema, { IRelation } from "./relation";
import notificationSchema, { INotification } from "./notification";
import vitalStatSchema, { IVitalStat } from "./vitalStat";

type UserRole = "ward" | "caregiver";

interface IUser {
  _id: number;
  firstName: string;
  lastName: string;
  title?: string;
  organization?: string;
  phoneNumber?: number;
  impairment?: string;
  email: string;
  password_hash: string;
  role: UserRole;
  relations: IRelation[];
  notifications: INotification[];
  vitalStats: IVitalStat[];
  refreshToken: String;
}

const userSchema = new Schema<IUser>({
  _id: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true },
  refreshToken: { type: String, default: "" },
  title: String,
  organization: String,
  impairment: String,
  relations: [relationSchema],
  notifications: [notificationSchema],
  vitalStats: [vitalStatSchema],
});

export default userSchema;
