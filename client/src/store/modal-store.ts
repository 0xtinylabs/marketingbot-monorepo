import { create } from "zustand";

export type ModalType = "add-wallet" | "target-token" | "withdraw" | "terminal" | null;

type State = {
  modal: ModalType;
  setModal: (modal: ModalType) => void;
  closeAll: () => void;
};

const useModalStore = create<State>((set) => ({
  modal: null,
  setModal: (modal) => set({ modal }),
  closeAll: () => set({ modal: null }),
}));

export default useModalStore;
