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
import * as  LinkButton from "@/components/ui/link-button";
import useModalStore from "@/store/modal-store";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { setModal } = useModalStore()

  return (
    <div className="flex justify-between">
      <LogoSVG />
      <div className="flex items-center gap-4">
        <LinkButton.Root onClick={() => {
          setModal("terminal")
        }}>Terminal</LinkButton.Root>
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

    </div>
  );
};

export default Header;
