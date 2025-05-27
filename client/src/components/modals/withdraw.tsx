"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";
import * as Modal from "@/components/ui/modal";

import * as Button from "@/components/ui/button";

import * as Input from "@/components/ui/input"

import useModalStore from "../../store/modal-store";
import useWalletStore from "../../store/wallet";
import { RiPercentLine } from "@remixicon/react";
import clsx from "clsx";
import useTokenStore from "@/store/token-store";
import api from "@/service/api";
import useUserStore from "@/store/user-store";
import toast from "react-hot-toast";
import ctoast from "../toast";

const will_remain_native = 0.3

const WithdrawModal = (props: PropsWithChildren) => {
  const { modal, closeAll } = useModalStore();


  const { selectedWallets, getSelectedWalletsBalanceTotalData, } = useWalletStore();

  const [withdraw_token, setWithdrawToken] = useState<"NATIVE" | "TOKEN" | null>()

  const [percentage, setPercentage] = useState<number | null>(null)

  const { token } = useTokenStore()

  const { user } = useUserStore()

  const [to_wallet_address, setToWalletAddress] = useState("")


  useEffect(() => {
    if (withdraw_token === "NATIVE" && percentage) {

      const total_native = getSelectedWalletsBalanceTotalData()?.eth_usd

      const calculated_amount = total_native * percentage / 100
      const sub = total_native - will_remain_native
      if (calculated_amount < will_remain_native) {
        return setPercentage(0)
      }
      if (calculated_amount > sub) {
        return setPercentage(Math.floor(sub / total_native * 100))
      }

    }
    if (withdraw_token === "TOKEN" && percentage) {
      if (percentage > 100) {
        setPercentage(100)
      }

    }
  }, [percentage, withdraw_token, selectedWallets])



  return (
    <Modal.Root
      open={modal === "withdraw"}
      onOpenChange={(o) => {
        if (!o) {
          closeAll();
        }
      }}
    >
      <Modal.Trigger asChild>{props.children}</Modal.Trigger>
      <Modal.Content showClose={false}>
        <Modal.Body>

          <Input.Root size="small">
            <Input.Wrapper>
              <Input.Input type="text" className="bg-bg-weak-50 text-text-disabled-300" disabled value={`${selectedWallets.length} Wallet Selected`} />
            </Input.Wrapper>
          </Input.Root>
          {selectedWallets.length > 0 && <>

            <div className="flex gap-x-[10px] mt-[10px]">
              <Button.Root onClick={() => {
                setWithdrawToken("NATIVE")
              }} size="medium" variant={withdraw_token === "NATIVE" ? "primary" : "neutral"} mode="stroke" className={clsx("justify-start flex-1", withdraw_token === "NATIVE" && "text-stroke-strong-950")}>
                ETH ${getSelectedWalletsBalanceTotalData().eth_usd?.toFixed(2)}
              </Button.Root>
              <Button.Root
                onClick={() => {
                  setWithdrawToken("TOKEN")
                }}

                size="medium" variant={withdraw_token === "TOKEN" ? "primary" : "neutral"} mode="stroke" className={clsx("justify-start flex-1", withdraw_token === "TOKEN" && "text-stroke-strong-950")}>
                {token?.ticker ?? "TOKEN"} ${getSelectedWalletsBalanceTotalData().token_usd?.toFixed(2)}
              </Button.Root>
            </div>
            <Input.Root className="mt-[10px]">
              <Input.Wrapper>
                <Input.Input value={String(percentage)} onChange={(e) => {
                  setPercentage(parseInt(e.target.value))
                }} placeholder="Withdraw amount" type={"number"} />
                <Input.Icon as={RiPercentLine} />
              </Input.Wrapper></Input.Root>
            <div className="mt-[4px] text-text-sub-600 text-label-xs">
              {withdraw_token && `Est: ${withdraw_token === "NATIVE" ? "$" + (getSelectedWalletsBalanceTotalData().eth_usd * (isNaN(percentage ?? 0) ? 0 : percentage!) / 100).toFixed(2) : "$" + (getSelectedWalletsBalanceTotalData().token_usd * (isNaN(percentage ?? 0) ? 0 : percentage!) / 100).toFixed(2)}`}
              {!withdraw_token && "Est: $0"}

            </div>
            <Input.Root className="mt-[10px]">
              <Input.Wrapper>
                <Input.Input value={to_wallet_address} onChange={(e) => {
                  setToWalletAddress(e.target.value)
                }} placeholder="Receiving wallet address" type={"text"} />
              </Input.Wrapper></Input.Root>
          </>}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="small"
              className="w-full"
              onClick={closeAll}
            >
              Cancel
            </Button.Root>
          </Modal.Close>
          {selectedWallets.length > 0 && <Button.Root
            disabled={!withdraw_token || !percentage || !to_wallet_address}

            onClick={async () => {
              if (user) {


                toast.dismiss()
                const id = ctoast("Withdrawing...", "loading")


                const total = await api.withdraw(user?.wallet_address, selectedWallets?.map(s => s.address), percentage ?? 0, to_wallet_address, withdraw_token ?? "NATIVE", token?.contract_address ?? '')

                if (total === 0) {
                  toast.remove(id)
                  ctoast("Denied", "error")
                }
                else {
                  toast.remove(id)
                  ctoast(`Completed ${total} / ${selectedWallets.length}`, "success")
                }

              }
            }} size="small" className="w-full">
            Withdraw
          </Button.Root>}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default WithdrawModal;
