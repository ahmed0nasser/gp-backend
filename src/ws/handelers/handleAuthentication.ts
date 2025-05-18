import { UserClaim } from "../../api/app/services/auth";
import clients from "../clients";
import NotPatientError from "../errors/NotPatientError";
import { AuthMessage } from "../interfaces";
import jwt from "jsonwebtoken";
import WebSocket from "ws";

export default function handleAuthentication(
  ws: WebSocket,
  data: any,
  clientId: string
) {
  const { accessToken } = data as AuthMessage;

  // Verify JWT
  try {
    const userClaim = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as UserClaim;
    if (userClaim.role !== "patient") {
      throw new NotPatientError();
    }
    const client = clients.get(clientId)!;
    client.userId = userClaim.id;
    clients.set(clientId, client);

    ws.send(
      JSON.stringify({
        status: "success",
        message: "Connection established successfully",
      })
    );
    console.log(`Client ${clientId} authenticated with userId ${userClaim.id}`);
  } catch (error) {
    if (error instanceof NotPatientError) {
      ws.send(
        JSON.stringify({
          status: "error",
          message: error.message,
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          status: "error",
          message: "Invalid access token",
        })
      );
    }
    ws.close();
  }
}
