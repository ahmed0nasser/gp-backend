import { Schema } from "mongoose";

export type RelationType = "relation" | "incoming" | "outgoing";

export interface IRelation {
  _id: number;
  relatedUserId: number;
  type: RelationType;
}

const relationSchema = new Schema<IRelation>(
  {
    _id: { type: Number, required: true },
    relatedUserId: { type: Number, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

export default relationSchema;
