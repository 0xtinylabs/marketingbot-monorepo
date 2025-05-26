import { create } from "zustand";

type State = {
    status: "down" | "up",
    setStatus: (status: "down" | "up") => void;
}

const useStatusStore = create<State>((set) => ({
    status: "up",
    setStatus: (status: "down" | "up") => set({ status }),
}));

export default useStatusStore;