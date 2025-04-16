import { Schema } from "mongoose";
import relationSchema, { IRelation } from "./relation";
import notificationSchema, { INotification } from "./notification";
import vitalStatSchema, { IVitalStat } from "./vitalStat";

export type UserRole = "ward" | "caregiver";

export interface IUser {
  id: number;
  _id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  deviceId: string;
  title: string;
  organization: string;
  phoneNumber: string;
  impairment: string;
  img: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  relations: IRelation[];
  notifications: INotification[];
  vitalStats: IVitalStat[];
  refreshToken?: String;
}

const userSchema = new Schema<IUser>({
  _id: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  deviceId: { type: String, default: "" },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  refreshToken: { type: String, default: "" },
  img: { type: String, default: "" },
  title: { type: String, default: "" },
  organization: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  impairment: { type: String, default: "" },
  relations: [relationSchema],
  notifications: [notificationSchema],
  vitalStats: [vitalStatSchema],
});

userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

export default userSchema;
