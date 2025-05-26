import React from "react";
import * as Badge from "@/components/ui/badge";
import numeral from "numeral";
import {
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimeFill,
} from "@remixicon/react";

type PropsType = {
  index: number;
  type: "SELL" | "BUY";
  wallet_index: number;
  usd_value: number;
  ticker: string;
  token_amount: number;
  status: "loading" | "error" | "success";
  market_cap: number;
  tx: string
};

const TransactionLine = (props: PropsType) => {
  return (
    <div onClick={() => {
      if (props.tx) {
        window.electron.openExternal("https://basescan.org/tx/" + props.tx);
      }
    }} className="flex justify-between px-2 text-label-sm py-3">
      <div className="flex gap-x-1  items-center">
        <span className="text-text-soft-400">{props.index}</span>
        <span>
          {props.type === "BUY" ? (
            <Badge.Root variant="light" color="green">
              BUY
            </Badge.Root>
          ) : (
            <Badge.Root variant="light" color="red">
              {" "}
              SELL
            </Badge.Root>
          )}
        </span>
        <span className="text-text-strong-950">W{props.wallet_index}</span>
        <span className="text-text-soft-400">
          ${(props.usd_value).toFixed(3)}
        </span>
        <span className="text-text-soft-400">${props.ticker}</span>
        <span className="text-text-soft-400">
          @{numeral(Number(props.market_cap)).format("0.00a")}

        </span>
      </div>
      <div>
        {props.status === "loading" && (
          <RiTimeFill className="text-orange-600" />
        )}
        {props.status === "error" && (
          <RiCloseCircleFill className="text-red-600" />
        )}
        {props.status === "success" && (
          <RiCheckboxCircleFill className="text-green-600" />
        )}
      </div>
    </div>
  );
};

export default TransactionLine;
