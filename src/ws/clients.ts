import { Client } from "./interfaces";

// Map to track authenticated clients
const clients: Map<string, Client> = new Map();

export default clients;
