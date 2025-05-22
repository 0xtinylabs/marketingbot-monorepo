import { create } from "zustand";
import { Socket } from "socket.io-client";

type State = {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
};

const useSocketStore = create<State>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}));

export default useSocketStore;
