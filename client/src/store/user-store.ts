import { UserType } from "@/types/common";
import { create } from "zustand";

type State = {
  user: UserType;
  setUser: (user: UserType) => void;
  loginUser: (user: UserType) => void;
  logoutUser: () => void;
};

const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  loginUser: (user) => set({ user }),
  logoutUser: () => set({ user: null }),
}));

export default useUserStore;
