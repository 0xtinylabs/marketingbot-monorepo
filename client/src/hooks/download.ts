import downloadCSV from "@/helpers/download-csv";
import api from "@/service/api";
import useUserStore from "@/store/user-store";

const useDownload = () => {
  const { user } = useUserStore();
  const downloadWallets = async () => {
    if (user?.wallet_address) {
      const wallets = await api.downloadWallets(
        user?.wallet_address,
      );
      downloadCSV(wallets);
    }
  };
  return { downloadWallets };
};

export default useDownload;
