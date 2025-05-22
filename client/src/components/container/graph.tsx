"use client";

import React from "react";
import useTokenStore from "../../store/token-store";
import { RiAlarmWarningLine } from "@remixicon/react";

const Graph = () => {
  const { token } = useTokenStore();

  return (
    <div className="flex-1 bg-bg-weak-50 flex">
      {token?.contract_address && (
        <iframe
          src={`https://www.geckoterminal.com/base/pools/${
            token?.pool_address ?? token?.contract_address
          }?chart_type=price&embed=1&grayscale=0&info=0&light_chart=0&resolution=15m&swaps=0`}
          className="flex-1"
          width={"100%"}
          height={"100%"}
        ></iframe>
      )}
      {!token?.contract_address && (
        <div className="flex-1 flex flex-col items-center justify-center text-white">
          <RiAlarmWarningLine />
          <p>Select a token to see dex graph</p>
        </div>
      )}
    </div>
  );
};

export default Graph;
