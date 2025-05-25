"use client";
import LogoSVG from "@/assets/svg/logo";
import React, { useState } from "react";
import * as Button from "@/components/ui/button";
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
import { RiRefreshLine } from "@remixicon/react";
import api from "@/service/api";
import useWalletStore from "@/store/wallet";
import clsx from "clsx";
import toast from "react-hot-toast";
import useTokenStore from "@/store/token-store";
import useTransactionSessionStore from "@/store/tranasction-session-store";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { setModal } = useModalStore()

  const { getErrorLogsCount } = useTerminalRecordStore()

  const [reloading, setReloading] = useState(false)

  const { setTransactionSession } = useTransactionSessionStore()

  const { setWallets, deselectAllWallets } = useWalletStore()

  const { available } = useUpdate()

  const { setToken } = useTokenStore()

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
        {address && <Button.Root


          onClick={async () => {
            setReloading(true)
            const wallets = await api.getAllWallets(address)

            setTransactionSession({
              interval: "FLAT",
              max_time: 0,
              min_time: 10,
              percentage: 10,
              status: "IDLE",
              type: "SINGLE"
            })
            setWallets(wallets.wallets)
            deselectAllWallets()
            toast.success("Wallets reloaded successfully")
            setReloading(false)
          }} variant="neutral" mode="ghost">
          {reloading ? "Reloading" : ""} <Button.Icon className={clsx(reloading ? "animate-spin" : "")} as={RiRefreshLine} />
        </Button.Root>}
        <LinkButton.Root onClick={() => {
          setModal("terminal")
        }}>Logs
          {getErrorLogsCount() > 0 && <Badge.Root color={'red'}>{getErrorLogsCount()}</Badge.Root>}
        </LinkButton.Root>
        <Button.Root
          variant={address ? "neutral" : "primary"}
          mode={address ? "stroke" : "filled"}
          onClick={() => {
            if (address) {
              disconnect();
              setWallets([])
              deselectAllWallets()
              setToken(null)
            } else {
              open();
            }
          }}
        >
          {address ? getWalletString(address) : "Connect"}
        </Button.Root>
      </div>

    </div>
  );
};

export default Header;
