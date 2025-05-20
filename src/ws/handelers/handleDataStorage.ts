import UserDoesNotExistError from "../../api/app/errors/UserDoesNotExistError";
import User from "../../api/app/models/user";
import clients from "../clients";
import { VitalData } from "../interfaces";

export default async function handleDataStorage(
  data: VitalData,
  clientId: string
) {
  const client = clients.get(clientId)!;
  const userId = Number(client.userId);
  const user = await User.findById(userId, "vitalStats");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }
  user.vitalStats.push({ timestamp: new Date(), ...data });
  await user.save();
}
