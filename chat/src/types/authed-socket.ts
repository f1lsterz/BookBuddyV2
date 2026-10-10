import { DefaultEventsMap, Socket } from "socket.io";

export type AuthedSocketData = {
  userId: string;
};

export type AuthedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthedSocketData
>;
