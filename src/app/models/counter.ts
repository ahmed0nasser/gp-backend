import { model } from "mongoose";
import counterSchema, {
  CounterId,
  ICounter,
} from "../schemas/database/counter";

const Counter = model<ICounter>("Counter", counterSchema);

export const getNextSequence = async (name: CounterId) => {
  let counter = await Counter.findById(name);
  if (!counter) {
    counter = new Counter({ _id: name });
  }
  counter.sequenceValue++;
  await counter.save();

  return counter.sequenceValue;
};

export const resetCounters = async () => {
  await Counter.deleteMany({});
};
