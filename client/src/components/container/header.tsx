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
import useTerminalRecordStore from "@/store/terminal-record";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { setModal } = useModalStore()

  const { getErrorLogsCount } = useTerminalRecordStore()

  const { available } = useUpdate()

  return (
    <div className="flex justify-between">
      <LogoSVG />
      <div className="flex items-center gap-4">

        {available && <LinkButton.Root onClick={() => {
          window.electron.send("reload")
        }}>
          <Badge.Root color="gray" className="!p-3">

            <Badge.Dot size="small"></Badge.Dot>
            Update Available
          </Badge.Root>
        </LinkButton.Root>}
        <LinkButton.Root onClick={() => {
          setModal("terminal")
        }}>Logs
          {getErrorLogsCount() > 0 && <Badge.Root color={'red'}>{getErrorLogsCount()}</Badge.Root>}
        </LinkButton.Root>
        <Button
          variant={address ? "neutral" : "primary"}
          mode={address ? "stroke" : "filled"}
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
