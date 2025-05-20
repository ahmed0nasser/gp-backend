import WebSocket from "ws";
import handleDataStorage from "./handleDataStorage";
import handleNotifyingCaregivers from "./handleNotifyingCaregivers";

export default async function handleSensorData(
  ws: WebSocket,
  data: any,
  clientId: string
) {
  await handleDataStorage(data, clientId);
  await handleNotifyingCaregivers(data, clientId);
  console.log(`Received sensor data from ${clientId}: `, data);
  // Send acknowledgment
  ws.send(
    JSON.stringify({
      status: "success",
      message: "Sensor data received",
    })
  );
}
