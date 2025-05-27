import { create } from "zustand";
import { Socket } from "socket.io-client";

type State = {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
  listenersInited: boolean,
  setListenersInited: (listenersInited: boolean) => void,

};

const useSocketStore = create<State>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  listenersInited: false,
  setListenersInited: (listenersInited) => set({ listenersInited })
}));

export default useSocketStore;
