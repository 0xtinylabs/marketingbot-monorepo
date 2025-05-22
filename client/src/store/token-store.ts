import { TokenType } from "@/types/common";
import { create } from "zustand";

type State = {
  token: TokenType;
  setToken: (token: TokenType) => void;
};

const useTokenStore = create<State>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));

export default useTokenStore;
