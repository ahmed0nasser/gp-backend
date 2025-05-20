import WebSocket from "ws";

export interface AuthMessage {
  accessToken: string;
}

export interface VitalData {
  temperature: number;
  heartRate: number;
  bloodOxygen: number;
}

export interface SystemNotification {
  type: "emergency" | "warning";
  title: string;
  body: string;
}

export interface Client {
  ws: WebSocket;
  userId: number | null;
}
