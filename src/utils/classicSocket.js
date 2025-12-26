import { io } from "socket.io-client";

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("http://localhost:9000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
    });
  }
  return socketInstance;
};

export const runClassicCheck = ({
  mac = "41:42:E9:F9:BB:DD",
  name = "safe",
  listen = 30,
  mic = 5,
}) => {
  const socket = getSocket();
  socket.emit(
    "classic:run",
    { mac: "41:42:E9:F9:BB:DD", listen: 10, mic: 2 },
    (ack) => {
      console.log("ack from server", ack);
    }
  );
};

export const setupClassicListeners = ({ onDone, onError } = {}) => {
  const socket = getSocket();
  if (onDone) socket.on("classic:done", onDone);
  if (onError) socket.on("classic:error", onError);
  return () => {
    if (onDone) socket.off("classic:done", onDone);
    if (onError) socket.off("classic:error", onError);
  };
};
