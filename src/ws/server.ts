import Joi from "joi";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import handleAuthentication from "./handelers/handleAuthentication";
import handleSensorData from "./handelers/handleSensorData";
import clients from "./clients";
import authenticationSchema from "./validation/authentication";
import sensorDataSchema from "./validation/sensorData";
import connectDB from "../dbConfig/connectDB";

// Connect to DB
connectDB();

// Create WebSocket server
const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });

wss.on("connection", (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(clientId, { ws, userId: null });

  ws.on("message", async (message: string) => {
    try {
      const data = JSON.parse(message);

      if (!clients.get(clientId)!.userId) {
        await authenticationSchema.validateAsync(data);
        // Handle authentication
        handleAuthentication(ws, data, clientId);
      } else {
        await sensorDataSchema.validateAsync(data);
        // Handle sensor data
        await handleSensorData(ws, data, clientId);
      }
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        ws.send(
          JSON.stringify({
            status: "error",
            message: error.details[0].message,
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            status: "error",
            message: "Invalid message format",
          })
        );
      }
    }
  });

  ws.on("close", () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

console.log(
  `WebSocket server running on ws://localhost:${process.env.WS_PORT}`
);
