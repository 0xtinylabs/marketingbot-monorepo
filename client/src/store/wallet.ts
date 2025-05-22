import { WalletType } from "@/types/common";
import { create } from "zustand";

type State = {
  wallets: WalletType[];
  setWallets: (wallets: WalletType[]) => void;
  addWallets: (wallets: WalletType[]) => void;
  selectedWallets: WalletType[];
  selectWallet: (wallet_address: WalletType["address"]) => void;
  unselectWallet: (wallet_address: WalletType["address"]) => void;
  deselectAllWallets: () => void;
  toggleWallet: (wallet_address: WalletType["address"]) => void;
};
const useWalletStore = create<State>((set, get) => ({
  wallets: [],
  addWallets: (wallets) => set({ wallets: [...get().wallets, ...wallets] }),
  setWallets: (wallets) => set({ wallets }),
  selectedWallets: [],
  deselectAllWallets: () => set({ selectedWallets: [] }),
  selectWallet: (wallet_address) => {
    const selectedWallets = get().selectedWallets;

    const wallets = get().wallets;
    const is_included = selectedWallets.find(
      (wallet) => wallet.address === wallet_address
    );
    if (is_included) {
      return;
    }
    const wallet = wallets.find((wallet) => wallet.address === wallet_address);
    if (wallet) {
      selectedWallets.push(wallet);
      return set({
        selectedWallets: selectedWallets,
      });
    }
  },
  toggleWallet: (wallet_address) => {
    const selectedWallets = get().selectedWallets;

    const wallets = get().wallets;
    const is_included = selectedWallets.find(
      (wallet) => wallet.address === wallet_address
    );
    if (is_included) {
      const selectedWalletsFiltered = selectedWallets.filter(
        (wallet) => wallet.address !== wallet_address
      );
      return set({
        selectedWallets: selectedWalletsFiltered,
      });
    }
    const wallet = wallets.find((wallet) => wallet.address === wallet_address);
    if (wallet) {
      selectedWallets.push(wallet);
      return set({
        selectedWallets: selectedWallets,
      });
    }
  },
  unselectWallet: (wallet_address) => {
    const selectedWalletsFiltered = get().selectedWallets.filter(
      (wallet) => wallet.address !== wallet_address
    );
    set({
      selectedWallets: selectedWalletsFiltered,
    });
  },
}));

export default useWalletStore;
