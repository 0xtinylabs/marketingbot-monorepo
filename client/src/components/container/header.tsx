"use client";
import LogoSVG from "@/assets/svg/logo";
import React from "react";
import { Root as Button } from "@/components/ui/button";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { getWalletString } from "@/helpers/string";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex justify-between">
      <LogoSVG />
      <Button
        onClick={() => {
          if (address) {
            disconnect();
          } else {
            open();
          }
        }}
      >
        {address ? getWalletString(address) : "Connect"}
      </Button>
    </div>
  );
};

export default Header;
