"use client";
import LogoSVG from "@/assets/svg/logo";
import React, { useState } from "react";
import * as Button from "@/components/ui/button";
import {
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react";
import { getWalletString } from "@/helpers/string";
import * as  LinkButton from "@/components/ui/link-button";
import useModalStore from "@/store/modal-store";
import useUpdate from "@/store/update";
import * as Badge from "@/components/ui/badge";
import useTerminalRecordStore from "@/store/terminal-record";
import { RiRefreshLine, RiServerLine } from "@remixicon/react";
import api from "@/service/api";
import useWalletStore from "@/store/wallet";
import clsx from "clsx";
import toast from "react-hot-toast";
import useTransactionSessionStore from "@/store/tranasction-session-store";
import useUser from "@/hooks/use-user";
import useStatusStore from "@/store/status";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { setModal } = useModalStore()

  const { getErrorLogsCount } = useTerminalRecordStore()

  const [reloading, setReloading] = useState(false)

  const { setTransactionSession } = useTransactionSessionStore()

  const { setWallets, deselectAllWallets } = useWalletStore()

  const { available } = useUpdate()

  const { status } = useStatusStore()

  const { logout } = useUser()

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
        <Button.Root onClick={() => {
          window.electron.send("restart-server")
        }} mode="lighter" className="relative" variant="neutral">
          <Button.Icon as={RiServerLine} />
          <div className={clsx("absolute w-[6px] aspect-square rounded-full", "top-[4px] left-[4px]", status === "up" ? "bg-green-500" : "bg-red-500")}></div>

        </Button.Root>
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
              logout()
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
