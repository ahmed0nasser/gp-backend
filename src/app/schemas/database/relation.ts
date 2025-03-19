import { Schema } from "mongoose";

type RelationStatus = "pending" | "accepted" | "rejected";

export interface IRelation {
  _id: number;
  senderId: number;
  receiverId: number;
  status: RelationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const relationSchema = new Schema<IRelation>(
  {
    _id: { type: Number, required: true },
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
  },
  { timestamps: true }
);

export default relationSchema;
