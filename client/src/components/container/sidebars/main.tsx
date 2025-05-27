"use client";

import Card, { CardText, CardTitle } from "@/components/common/card";
import React, { useState } from "react";
import * as Button from "@/components/ui/button";
import {
  RiArrowLeftDownLine,
  RiArrowRightUpLine,
  RiEyeFill,
  RiEyeOffFill,
  RiPercentLine,
  RiStopCircleLine,
  RiTimerLine,
} from "@remixicon/react";
import * as Input from "@/components/ui/input";
import * as SegmentedControl from "@/components/ui/segmented-control";
import WalletSettingsMenu from "@/components/menus/wallet-settings";
import clsx from "clsx";
import useTransactionSessionStore from "@/store/tranasction-session-store";
import WalletsContainer from "@/components/wallets-container";
import useSocket from "@/hooks/socket";
import useTokenStore from "@/store/token-store";
import useWalletStore from "@/store/wallet";

const MainSidebar = () => {
  const { setTransactionSessionOption, transactionSession } =
    useTransactionSessionStore();

  const [showWallets, setShowWallets] = useState(false);

  const { emitSessionStart, emitSessionStop } = useSocket();

  const { token } = useTokenStore()

  const { getWalletsBalanceTotalData, getSelectedWalletsBalanceTotalData, selectedWallets, deselectAllWallets, selecteAllWallets } = useWalletStore()

  console.log(transactionSession)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Card className="rounded-t-[10px] border-b-0">
        <CardTitle>Total Value</CardTitle>
        <CardText>${getWalletsBalanceTotalData().usd?.toFixed(2)}</CardText>
      </Card>
      <div className="flex">
        <Card className="flex-1 border-r-0">
          <CardTitle>ETH Value</CardTitle>
          <CardText>${getWalletsBalanceTotalData().eth_usd?.toFixed(3)}</CardText>
        </Card>
        <Card className="flex-1">
          <CardTitle>{token?.ticker ?? "TOKEN"} Value</CardTitle>
          <CardText>${getWalletsBalanceTotalData().token_usd?.toFixed(2)}</CardText>
        </Card>
      </div>
      <Card className="flex-1 flex flex-col overflow-hidden border-t-0">
        <Card className={clsx("flex flex-col", showWallets && "flex-1")}>
          <div>
            <Button.Root
              className="w-full bg-white-0 flex justify-between"
              mode="ghost"
              variant="neutral"
            >
              Wallet Settings
              <div className="text-xs flex gap-x-2 items-center">
                {selectedWallets?.length > 0 && <span className="text-primary-base">{selectedWallets?.length}W</span>}
                {!showWallets && <span onClick={selecteAllWallets} className="text-text-sub-600">S all</span>}
                {!showWallets && <span onClick={deselectAllWallets} className="text-text-sub-600">D all</span>}
                <WalletSettingsMenu />
                <Button.Icon
                  onClick={() => {
                    setShowWallets(!showWallets);
                  }}
                  as={!showWallets ? RiEyeOffFill : RiEyeFill}
                  size="xxsmall"
                />
              </div>
            </Button.Root>
          </div>
          {showWallets && <WalletsContainer />}
        </Card>
        <h3 className="text-text-strong-950 text-label-sm !mt-4">
          Amount Settings
        </h3>
        <Input.Root className="bg-transparent">
          <Input.Wrapper className="bg-transparent">
            <Input.Input
              value={transactionSession?.percentage ?? ""}
              onChange={(e) => {
                setTransactionSessionOption(
                  "percentage",
                  parseInt(e.target.value)
                );
              }}
              type="number"
              placeholder="Add percentage..."
            />
            <Input.Icon as={RiPercentLine} />
          </Input.Wrapper>
        </Input.Root>
        <p className="text-text-sub-600 text-[12px]">
          <span className="text-green-600">Buy:</span> ${(getSelectedWalletsBalanceTotalData().eth_usd * (transactionSession?.percentage ?? 1) / 100).toFixed(2)} TOKEN /{" "}
          <span className="text-red-600">Sell:</span> ${(getSelectedWalletsBalanceTotalData().token_usd * (transactionSession?.percentage ?? 1) / 100).toFixed(2)} WETH
        </p>
        <h3 className="text-text-strong-950 text-label-sm !mt-4">
          Swap Intervals
        </h3>
        <SegmentedControl.Root defaultValue="FLAT">
          <SegmentedControl.List>
            <SegmentedControl.Trigger
              value="FLAT"
              onClick={() => {
                setTransactionSessionOption("interval", "FLAT");
              }}
            >
              Flat
            </SegmentedControl.Trigger>
            <SegmentedControl.Trigger
              value="MINMAX"
              onClick={() => {
                setTransactionSessionOption("interval", "MINMAX");
              }}
            >
              Min/Max
            </SegmentedControl.Trigger>
          </SegmentedControl.List>
        </SegmentedControl.Root>
        <div className="flex gap-x-2">
          <Input.Root className="bg-transparent">
            <Input.Wrapper className="bg-transparent">
              <Input.Icon as={RiTimerLine} />
              <Input.Input
                onChange={(e) => {
                  setTransactionSessionOption(
                    "min_time",
                    parseInt(e.target.value)
                  );
                }}
                value={transactionSession?.min_time ?? ""}

                type="number"
                placeholder={
                  transactionSession?.interval === "MINMAX"
                    ? "Min"
                    : "0 seconds"
                }
              />
            </Input.Wrapper>
          </Input.Root>
          {transactionSession?.interval === "MINMAX" && (
            <Input.Root className="bg-transparent">
              <Input.Wrapper className="bg-transparent">
                <Input.Icon as={RiTimerLine} />
                <Input.Input
                  value={transactionSession?.max_time ?? ""}

                  onChange={(e) => {
                    setTransactionSessionOption(
                      "max_time",
                      parseInt(e.target.value)
                    );
                  }}
                  placeholder="Max"
                />
              </Input.Wrapper>
            </Input.Root>
          )}
        </div>

      </Card>
      <Card className="border-t-0 rounded-b-[10px]">
        <SegmentedControl.Root defaultValue="SINGLE">
          <SegmentedControl.List>
            <SegmentedControl.Trigger
              onClick={() => {
                setTransactionSessionOption("type", "SINGLE");
              }}
              value="SINGLE"
            >
              Single Session
            </SegmentedControl.Trigger>
            <SegmentedControl.Trigger
              value="LOOP"
              onClick={() => {
                setTransactionSessionOption("type", "LOOP");
              }}
            >
              Loop
            </SegmentedControl.Trigger>
          </SegmentedControl.List>
        </SegmentedControl.Root>
        <div className="flex gap-x-3 py-2">
          {transactionSession?.status !== "RUNNING" && <>
            <Button.Root
              onClick={() => {
                setTransactionSessionOption("transaction", "BUY");
                emitSessionStart("BUY")
                setTransactionSessionOption("status", "RUNNING")

              }}
              variant="primary"
              mode={
                "filled"
              }
              className={clsx("flex-1")}
            >
              <Button.Icon as={RiArrowLeftDownLine} /> Buy
            </Button.Root>
            <Button.Root
              onClick={() => {
                setTransactionSessionOption("transaction", "SELL");
                setTransactionSessionOption("status", "RUNNING")
                emitSessionStart("SELL")
              }}
              mode={
                "filled"
              }
              className="flex-1 "
              variant="error"
            >
              <Button.Icon as={RiArrowRightUpLine} /> Sell
            </Button.Root></>}
          {transactionSession?.status === "RUNNING" && (
            <Button.Root
              className="flex-1"
              variant={
                transactionSession?.transaction === "AUTO" ? "primary" : "neutral"
              }
              mode="stroke"
              onClick={emitSessionStop}
            >
              <>
                <Button.Icon as={RiStopCircleLine} /> Stop
              </>
            </Button.Root>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MainSidebar;
