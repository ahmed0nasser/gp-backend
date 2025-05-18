import { Schema } from "mongoose";

export interface IVitalStat {
  timestamp: Date;
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
}

const vitalStatSchema = new Schema<IVitalStat>({
  timestamp: { type: Date, default: Date.now() },
  heartRate: Number,
  bloodOxygen: Number,
  temperature: Number,
});

export default vitalStatSchema;
