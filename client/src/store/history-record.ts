import { TransactionLineType } from "@/types/common";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { nanoid } from "nanoid";
export enum RecordTypeEnum {
  END,
  START,
  NORMAL,
}
type RecordType = {
  type: RecordTypeEnum;
  line?: TransactionLineType;
  id?: string;
  is_loop?: boolean;
  loop_index?: number;
};

type WalletRecordType = Record<string, RecordType[]>;

type State = {
  walletRecords: WalletRecordType;
  getRecordsForWallet: (wallet_address: string) => void;
  resetAllRecords: () => void;
  setWalletRecords: (wallet_address: string, records: RecordType[]) => void;
  addWalletRecord: (wallet_address: string, record: RecordType, id: string) => void;
  clearAllRecordsForWallet: (wallet_address: string) => void;
  clearAllRecords: (id: string) => void;
  updateWalletRecord: (
    wallet_address: string,
    id: string,
    key: keyof RecordType,
    value: RecordType[typeof key]
  ) => void;
};

const useHistoryRecordStore = create<State>()(
  persist(
    (set, get) => ({
      resetAllRecords: () => {
        return set({ walletRecords: {} });
      },
      clearAllRecords: () => {
        const walletRecords = get().walletRecords;
        for (const wallet_address in walletRecords) {
          walletRecords[wallet_address] = [];
        }

        return set({ walletRecords });
      },

      clearAllRecordsForWallet: (wallet_address) => {
        const walletRecords = get().walletRecords;

        if (walletRecords[wallet_address]) {
          walletRecords[wallet_address] = []
        }
        return set({ walletRecords });
      },
      walletRecords: {},
      addWalletRecord: (wallet_address, record, id) => {
        const walletRecords = get().walletRecords;
        console.log(walletRecords, walletRecords[wallet_address])

        record.id = id;
        walletRecords[wallet_address] = [
          ...(walletRecords[wallet_address] ?? []),
          record,
        ];
        return set({ walletRecords });
      },
      setWalletRecords: (wallet_address, records) => {
        for (const record of records) {
          record.id = nanoid();
        }
        const walletRecords = get().walletRecords;
        walletRecords[wallet_address] = records;
        return set({
          walletRecords,
        });
      },
      getRecordsForWallet: (wallet_address) => {
        return get().walletRecords[wallet_address];
      },
      updateWalletRecord: (wallet_address, id, key, value) => {
        const walletRecords = get().walletRecords;
        const records = walletRecords[wallet_address];
        for (const record of records) {
          if (record.id === id) {
            if (value && key && record[key]) {
              (record[key] as any) = value;
            }
          }
        }
        return set({ walletRecords });
      },
    }),
    { name: "history-record", storage: createJSONStorage(() => localStorage) }
  )
);

export default useHistoryRecordStore;
