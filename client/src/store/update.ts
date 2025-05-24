import { create } from "zustand";


type State = {
    available: boolean;
    setAvailable: (available: boolean) => void;
}
const useUpdate = create<State>((set) => ({
    available: false,
    setAvailable: (available: boolean) => set({ available }),
}))

export default useUpdate;