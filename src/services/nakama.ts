
import { Client, Session } from "@heroiclabs/nakama-js";

const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || "7350";
const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || "127.0.0.1";
const NAKAMA_KEY = import.meta.env.VITE_NAKAMA_KEY || "defaultkey";

export const client = new Client(NAKAMA_KEY, NAKAMA_HOST, NAKAMA_PORT, false);

export async function authenticate(username: string): Promise<Session> {
  const deviceId = localStorage.getItem("nakama_device_id") || 
                   (() => {
                     const id = Math.random().toString(36).substring(2, 11);
                     localStorage.setItem("nakama_device_id", id);
                     return id;
                   })();
  
  const session = await client.authenticateDevice(deviceId, true, username);
  return session;
}

export async function createSocket(session: Session) {
  const socket = client.createSocket(false, false);
  return await socket.connect(session, true);
}
