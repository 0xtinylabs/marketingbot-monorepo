"use client";
import LogoSVG from "@/assets/svg/logo";
import React, { useEffect, useRef, useState } from "react";
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
import { RiDownloadCloudLine, RiLineChartFill, RiRefreshLine, RiServerLine, RiSkullFill } from "@remixicon/react";
import api from "@/service/api";
import useWalletStore from "@/store/wallet";
import clsx from "clsx";
import toast from "react-hot-toast";
import useUser from "@/hooks/use-user";
import useStatusStore from "@/store/status";
import useAppSettingsStore from "@/store/app-settings";
import useUserStore from "@/store/user-store";
import useSocket from "@/hooks/socket";

const Header = () => {
  const { open } = useAppKit();
  const { address } = useAppKitAccount();
  const { setModal } = useModalStore()

  const { getErrorLogsCount } = useTerminalRecordStore()

  const [reloading, setReloading] = useState(false)


  const { setWallets, deselectAllWallets } = useWalletStore()

  const { available } = useUpdate()

  const { status } = useStatusStore()

  const { logout } = useUser()
  const { toggleGraph } = useAppSettingsStore()

  const { user } = useUserStore()

  const interval = useRef<NodeJS.Timeout>(null)

  const { emitSessionStop } = useSocket()

  useEffect(() => {
    if (user) {

      interval.current = setInterval(async () => {
        api.getAllWallets(user.wallet_address).then(res => {

          setWallets(res.wallets)
        })
      }, 5000)
    }
    else {
      if (interval.current) {
        clearInterval(interval.current)
      }
      setWallets([])

    }
    return () => {
      if (interval.current) {

        clearInterval(interval.current)
      }
    }

  }, [user])

  return (
    <div className="flex justify-between">
      <LogoSVG />
      <div className="flex items-center gap-3">


        <LinkButton.Root onClick={() => {
          setModal("terminal")
        }}>Logs
          {getErrorLogsCount() > 0 && <Badge.Root color={'red'}>{getErrorLogsCount()}</Badge.Root>}
        </LinkButton.Root>
        {address && <Button.Root onClick={
          emitSessionStop
        } variant="error" color="red" mode="lighter" size="small"><Button.Icon as={RiSkullFill} /></Button.Root>}
        {address && <Button.Root


          onClick={async () => {
            setReloading(true)
            const wallets = await api.getAllWallets(address)

            // setTransactionSession({
            //   interval: "FLAT",
            //   max_time: 0,
            //   min_time: 10,
            //   percentage: 10,
            //   status: "RUNNING",
            //   type: "SINGLE"
            // })
            setWallets(wallets.wallets)
            deselectAllWallets()
            toast.success("Wallets reloaded successfully")
            setReloading(false)
          }} variant="neutral" mode="lighter" size="small">
          {reloading ? "Reloading" : ""} <Button.Icon className={clsx(reloading ? "animate-spin" : "")} as={RiRefreshLine} />
        </Button.Root>}

        <Button.Root onClick={toggleGraph} variant="neutral" mode="lighter" size="small">
          <Button.Icon as={RiLineChartFill} />
        </Button.Root>
        <Button.Root onClick={() => {
          window.electron.send("restart-server")
        }} size="small" mode="lighter" className="relative" variant="neutral">
          <Button.Icon as={RiServerLine} />
          <div className={clsx("absolute w-[6px] aspect-square rounded-full", "top-[4px] left-[4px]", status === "up" ? "bg-green-500" : "bg-red-500")}></div>

        </Button.Root>
        {available && <Button.Root onClick={() => {
          window.electron.send("reload")
        }} size="small" mode="lighter" className="relative" variant="primary">
          <Button.Icon as={RiDownloadCloudLine} />

        </Button.Root>}

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
