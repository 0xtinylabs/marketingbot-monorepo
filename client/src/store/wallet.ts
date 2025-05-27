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
  getWalletsBalanceTotalData: () => { eth: any, usd: any, token_usd: any, eth_usd: any, weth_usd: any };
  getSelectedWalletsBalanceTotalData: () => { eth: any, usd: any, token_usd: any, eth_usd: any, weth_usd: any };
  selecteAllWallets: () => WalletType[];
};
const useWalletStore = create<State>((set, get) => ({
  wallets: [],
  selecteAllWallets: () => {
    const selectedWallets = get().wallets;
    set({ selectedWallets });
    return selectedWallets;
  },
  getWalletsBalanceTotalData: () => {
    const result = {
      eth: 0,
      usd: 0,
      token_usd: 0,
      eth_usd: 0,
      weth_usd: 0
    }
    get().wallets.forEach((wallet) => {
      result.eth += wallet.total_eth ?? 0;
      result.usd += wallet.total_usd ?? 0;
      result.token_usd += wallet.token_usd ?? 0;
      result.eth_usd += wallet.eth_usd ?? 0;
      result.weth_usd += wallet.weth_usd ?? 0
    });
    return result;


  },
  getSelectedWalletsBalanceTotalData: () => {
    const result = {
      eth: 0,
      usd: 0,
      token_usd: 0,
      eth_usd: 0,
      weth_usd: 0
    }
    get().selectedWallets.forEach((wallet) => {
      result.eth += wallet.total_eth ?? 0;
      result.usd += wallet.total_usd ?? 0;
      result.token_usd += wallet.token_usd ?? 0;
      result.eth_usd += wallet.eth_usd ?? 0;
      result.weth_usd += wallet.weth_usd ?? 0
    });
    return result;
  },
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
