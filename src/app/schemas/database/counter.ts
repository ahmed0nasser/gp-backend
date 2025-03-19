import { Schema } from "mongoose";

type CounterId = "user" | "relation" | "notification";

interface ICounter {
  _id: CounterId;
  sequenceValue: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0, required: true },
});

export default counterSchema;
