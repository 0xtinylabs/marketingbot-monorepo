import { TransactionSessionType } from "@/types/common";
import { create } from "zustand";

type State = {
  transactionSession: TransactionSessionType | null;
  setTransactionSessionOption: (
    key: keyof TransactionSessionType,
    value: TransactionSessionType[typeof key]
  ) => void;
  setTransactionSession: (
    transactionSession: TransactionSessionType | null
  ) => void;
};

const useTransactionSessionStore = create<State>((set, get) => ({
  transactionSession: { interval: "FLAT", max_time: 0, min_time: 1, percentage: 10, type: "SINGLE", is_loop: false, is_flat: true },
  setTransactionSession: (transactionSession) => set({ transactionSession }),
  setTransactionSessionOption: (key, value) =>
    set({ transactionSession: { ...get()?.transactionSession, [key]: value } }),
}));

export default useTransactionSessionStore;
