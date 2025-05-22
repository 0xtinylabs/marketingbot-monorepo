import Card, { CardTitle } from "@/components/common/card";
import React from "react";
import * as LinkButton from "@/components/ui/link-button";
import {
  HistoryEndLabel,
  HistoryStartLabel,
} from "@/components/history/labels";
import useHistoryRecordStore, { RecordTypeEnum } from "@/store/history-record";
import useUserStore from "@/store/user-store";
import TransactionLine from "@/components/history/transaction";

const HistorySidebar = () => {
  const { walletRecords } = useHistoryRecordStore();
  const { user } = useUserStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Card className="px-0  ">
        <div className="flex-row flex items-center justify-between px-2">
          <CardTitle>History</CardTitle>
          <LinkButton.Root>clear</LinkButton.Root>
        </div>
      </Card>
      <div className="flex-1 overflow-auto basis-0 self-stretch ">
        <Card className="min-h-full h-full max-h-full">
          {user?.wallet_address &&
            walletRecords[user.wallet_address] &&
            walletRecords[user.wallet_address]?.map((wallet_record) => {
              if (wallet_record.type === RecordTypeEnum.START) {
                return (
                  <HistoryStartLabel
                    key={wallet_record.id}
                    date={new Date()}
                    iteration={wallet_record.loop_index ?? 0}
                    type={wallet_record.is_loop ? "LOOP" : "SINGLE"}
                  />
                );
              }
              if (wallet_record.type === RecordTypeEnum.END) {
                return (
                  <HistoryEndLabel
                    key={wallet_record.id}
                    date={new Date()}
                    type={wallet_record.is_loop ? "LOOP" : "SINGLE"}
                  />
                );
              }
              if (wallet_record.type === RecordTypeEnum.NORMAL) {
                return (
                  <TransactionLine
                    key={wallet_record.id}
                    {...wallet_record.line}
                    status={wallet_record.line?.status ?? "loading"}
                    ticker={wallet_record.line?.ticker ?? ""}
                    token_amount={wallet_record.line?.token_amount ?? 0}
                    type={wallet_record.line?.type ?? "BUY"}
                    index={wallet_record.loop_index ?? 0}
                    usd_value={wallet_record?.line?.usd_value ?? 0}
                    wallet_index={wallet_record?.line?.index ?? 0}
                  />
                );
              }
            })}
        </Card>
      </div>
    </div>
  );
};

export default HistorySidebar;
