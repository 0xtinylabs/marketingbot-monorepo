import useHistoryRecordStore, { RecordTypeEnum } from "@/store/history-record";
import useSocketStore from "@/store/socket-store";
import useTransactionSessionStore from "@/store/tranasction-session-store";
import useUserStore from "@/store/user-store";
import useWalletStore from "@/store/wallet";
import { TransactionLineType } from "@/types/common";
import { useEffect } from "react";

const useSocket = () => {
  const { socket } = useSocketStore();
  const { transactionSession, setTransactionSessionOption } = useTransactionSessionStore();
  const { user } = useUserStore();
  const { addWalletRecord, updateWalletRecord } = useHistoryRecordStore();
  const { selectedWallets } = useWalletStore();


  const emitSessionStart = (transaction: "BUY" | "SELL") => {

    socket?.emit("session-start", {
      sessionData: { ...transactionSession, transaction },
      wallet_address: user?.wallet_address,
      wallets: selectedWallets
    });
  };

  const emitSessionStop = () => {
    socket?.emit("session-stop", {
      wallet_address: user?.wallet_address,
      isLoop: transactionSession?.type === "LOOP",
    });
    setTransactionSessionOption("status", "IDLE")
  };

  const initListeners = () => {
    if (!user?.wallet_address) {
      return;
    }
    console.log("init socket listeners", user?.wallet_address);
    socket?.on(
      "session-start",
      (data: { isLoop: boolean; loopIndex: number, id: string }) => {

        addWalletRecord(user?.wallet_address, {
          type: RecordTypeEnum.START,
          is_loop: data.isLoop,
          loop_index: data.loopIndex,


        }, data.id);
      }
    );
    socket?.on("session-end", (data: { isLoop: boolean, id: string }) => {
      setTimeout(() => {
        addWalletRecord(user?.wallet_address, {
          type: RecordTypeEnum.END,
          is_loop: data.isLoop,

        }, data.id);

        setTransactionSessionOption("transaction", undefined)
        setTransactionSessionOption("status", "IDLE")
      }, 2000)
    });


    socket?.on("session-line", (data: TransactionLineType) => {
      if (data.status === "loading") {

        addWalletRecord(user?.wallet_address, {
          type: RecordTypeEnum.NORMAL,
          line: data,
        }, data.id);
      }
      else {
        updateWalletRecord(user?.wallet_address, data.id, "line", data);
      }
    });
  };

  useEffect(() => {
    if (socket) {
      initListeners();
    }
  }, [socket, user?.wallet_address]);

  return { emitSessionStart, emitSessionStop, socket };
};
export default useSocket;
