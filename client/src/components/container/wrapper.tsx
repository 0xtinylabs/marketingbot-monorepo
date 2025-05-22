import React, { PropsWithChildren } from "react";
import Header from "./header";
import AddWalletsModal from "../modals/add-wallets";
import TargetTokenModal from "../modals/target-token";
import WithdrawModal from "../modals/withdraw";

const Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-screen h-screen flex flex-col bg-bg-white-0 py-[15px] px-[10px] gap-y-[10px]">
      <Header />
      {children}
      <AddWalletsModal />
      <TargetTokenModal />
      <WithdrawModal />
    </div>
  );
};

export default Wrapper;
