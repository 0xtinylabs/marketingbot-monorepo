import { SIGNMESSAGES } from "@/constants";
import downloadCSV from "@/helpers/download-csv";
import signMessage from "@/helpers/sign-message";
import api from "@/service/api";
import useUserStore from "@/store/user-store";
import { useAppKitProvider } from "@reown/appkit/react";

const useDownload = () => {
  const { user } = useUserStore();
  const { walletProvider } = useAppKitProvider("eip155")
  const downloadWallets = async () => {
    const signature = await signMessage(walletProvider, SIGNMESSAGES.DOWNLOAD_WALLETS);
    if (user?.wallet_address && signature) {
      const wallets = await api.downloadWallets(
        user?.wallet_address,
        signature
      );
      downloadCSV(wallets);
    }
  };
  return { downloadWallets };
};

export default useDownload;
