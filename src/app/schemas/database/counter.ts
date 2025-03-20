import { Schema } from "mongoose";

export type CounterId = "user" | "relation" | "notification";

export interface ICounter {
  _id: CounterId;
  sequenceValue: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

export default counterSchema;
