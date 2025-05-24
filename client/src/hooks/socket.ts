import useHistoryRecordStore, { RecordTypeEnum } from "@/store/history-record";
import useSocketStore from "@/store/socket-store";
import useTransactionSessionStore from "@/store/tranasction-session-store";
import useUserStore from "@/store/user-store";
import { TransactionLineType } from "@/types/common";
import { useEffect } from "react";

const useSocket = () => {
  const { socket } = useSocketStore();
  const { transactionSession } = useTransactionSessionStore();
  const { user } = useUserStore();
  const { addWalletRecord } = useHistoryRecordStore();

  const emitSessionStart = () => {
    socket?.emit("session-start", {
      sessionData: transactionSession,
      wallet_address: user?.wallet_address,
    });
  };

  const emitSessionStop = () => {
    socket?.emit("session-stop", {
      wallet_address: user?.wallet_address,
      isLoop: transactionSession?.type === "LOOP"
    });
  };

  const initListeners = () => {
    if (!user?.wallet_address) {
      return;
    }
    socket?.on(
      "session-start",
      (data: { isLoop: boolean; loopIndex: number }) => {
        addWalletRecord(user?.wallet_address, {
          type: RecordTypeEnum.START,
          is_loop: data.isLoop,
          loop_index: data.loopIndex,
        });
      }
    );
    socket?.on("session-end", (data: { isLoop: boolean }) => {
      addWalletRecord(user?.wallet_address, {
        type: RecordTypeEnum.END,
        is_loop: data.isLoop,
      });
    });
    socket?.on("session-line", (data: TransactionLineType) => {
      addWalletRecord(user?.wallet_address, {
        type: RecordTypeEnum.NORMAL,
        line: data,
      });
    });
  };

  useEffect(() => {
    if (socket) {
      initListeners();
    }
  }, [socket]);

  return { emitSessionStart, emitSessionStop, socket };
};
export default useSocket;
