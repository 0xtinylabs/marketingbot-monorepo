"use client";
import React, { PropsWithChildren } from "react";
import Header from "./header";
import AddWalletsModal from "../modals/add-wallets";
import TargetTokenModal from "../modals/target-token";
import WithdrawModal from "../modals/withdraw";
import TerminalModal from "../modals/terminal";
import useIpcListener from "@/hooks/ipc-listener";

const Wrapper = ({ children }: PropsWithChildren) => {

  useIpcListener()

  return (
    <div className="w-screen h-screen flex flex-col bg-bg-white-0 py-[15px] px-[10px] gap-y-[10px]">
      <Header />
      {children}
      <AddWalletsModal />
      <TargetTokenModal />
      <WithdrawModal />
      <TerminalModal />
    </div>
  );
};

export default Wrapper;
