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
import useUpdate from "@/store/update";
import * as Badge from "@/components/ui/badge";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { setModal } = useModalStore()

  const { available } = useUpdate()

  return (
    <div className="flex justify-between">
      <LogoSVG />
      <div className="flex items-center gap-4">

        {available && <LinkButton.Root onClick={() => {
          window.electron.send("reload")
        }}>
          <Badge.Root>

            <Badge.Dot></Badge.Dot>
          </Badge.Root>
          Update Available
        </LinkButton.Root>}
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
