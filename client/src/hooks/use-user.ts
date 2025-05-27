import { SIGNMESSAGES } from "@/constants";
import signMessage from "@/helpers/sign-message";
import api from "@/service/api";
import { useAppKitProvider, useDisconnect } from "@reown/appkit/react";
import useUserStore from "../store/user-store";
import useWalletStore from "../store/wallet";
import toast from "react-hot-toast";
import useTokenStore from "@/store/token-store";
import { io } from "socket.io-client";
import useSocketStore from "@/store/socket-store";
import ctoast from "@/components/toast";

const useUser = () => {
  const { disconnect } = useDisconnect();
  const { setToken } = useTokenStore();
  const { loginUser, logoutUser } = useUserStore();
  const { setWallets, deselectAllWallets, wallets } = useWalletStore();
  const { setSocket } = useSocketStore();
  const { walletProvider } = useAppKitProvider("eip155")

  const connectSocket = async (address: string) => {
    try {
      const signature = await signMessage(walletProvider, SIGNMESSAGES.CONNECT_SOCKET);
      if (signature) {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
          extraHeaders: {
            "x-wallet_address": address,
            "x-signature": signature,
          },
        });
        socket.connect();
        setSocket(socket);
      }
    } catch {
      ctoast("Could not connect socket", "error");
    }
  };

  const logout = () => {
    setSocket(null);
    setWallets([]);
    setToken(null);

    deselectAllWallets();
    logoutUser();
    disconnect()
  }

  const setUserToken = async (address: string, token_address: string) => {
    try {
      const res = await api.setUserToken(address, token_address);
      setToken(res.token);
    } catch (err) {
      console.log(err);
      toast.error("Could not create wallets");
    }
  };

  const createWallets = async (address: string, count: number) => {
    try {

      const res = await api.createWallets(address, count);
      console.log(res);
      setWallets([...wallets, ...res.wallets]);
    } catch (err) {
      console.log(err);
      toast.error("Could not create wallets");
    }
  };

  const login = async (address: string) => {
    try {
      const signature = await signMessage(walletProvider, SIGNMESSAGES.LOGIN);
      if (signature) {
        toast.dismiss()
        const id = ctoast("Getting data", "loading");
        const res = await api.login(address, signature);
        toast.remove(id);
        if (res.user) {
          loginUser(res.user);
        }
        setWallets(res.wallets);
        setToken(res.token);
        deselectAllWallets();
      }
    } catch {
      // disconnect();
    }
  };

  return { login, createWallets, setUserToken, connectSocket, logout };
};

export default useUser;
