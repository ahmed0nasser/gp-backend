import WebSocket from "ws";

export interface AuthMessage {
  accessToken: string;
}

export interface SensorData {
  temperature: number;
  heartRate: number;
  bloodOxygen: number;
}

export interface Client {
  ws: WebSocket;
  userId: number | null;
}
