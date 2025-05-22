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
  RiPlayCircleLine,
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

const MainSidebar = () => {
  const { setTransactionSessionOption, transactionSession } =
    useTransactionSessionStore();

  const [showWallets, setShowWallets] = useState(false);

  const { emitSessionStart } = useSocket();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Card className="rounded-t-md border-b-0">
        <CardTitle>Total Value</CardTitle>
        <CardText>0$</CardText>
      </Card>
      <div className="flex">
        <Card className="flex-1">
          <CardTitle>ETH Value</CardTitle>
          <CardText>0$</CardText>
        </Card>
        <Card className="flex-1">
          <CardTitle>Token Value</CardTitle>
          <CardText>0$</CardText>
        </Card>
      </div>
      <Card className="flex-1 flex flex-col">
        <div>
          <Button.Root
            className="w-full bg-white-0 flex justify-between"
            mode="stroke"
            variant="neutral"
          >
            Wallet Settings
            <div className="text-xs flex gap-x-2 items-center">
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
        <h3 className="text-text-strong-950 text-label-sm !mt-4">
          Amount Settings
        </h3>
        <Input.Root className="bg-transparent">
          <Input.Wrapper className="bg-transparent">
            <Input.Input
              onChange={(e) => {
                setTransactionSessionOption(
                  "percentage",
                  parseInt(e.target.value)
                );
              }}
              placeholder="Add percentage..."
            />
            <Input.Icon as={RiPercentLine} />
          </Input.Wrapper>
        </Input.Root>
        <p className="text-text-sub-600 text-[12px]">
          <span className="text-green-600">Buy:</span> $0 TOKEN /{" "}
          <span className="text-red-600">Sell:</span> $0 ETH
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

        <div className="flex-1"></div>
      </Card>
      <Card className="border-t-0 rounded-b-md">
        <SegmentedControl.Root defaultValue="SINGLE">
          <SegmentedControl.List>
            <SegmentedControl.Trigger
              onClick={() => {
                setTransactionSessionOption("type", "SINGLE");
              }}
              value=""
            >
              Single Session
            </SegmentedControl.Trigger>
            <SegmentedControl.Trigger
              value="system"
              onClick={() => {
                setTransactionSessionOption("type", "LOOP");
              }}
            >
              Loop
            </SegmentedControl.Trigger>
          </SegmentedControl.List>
        </SegmentedControl.Root>
        <div className="flex gap-x-3 py-2">
          <Button.Root
            onClick={() => {
              setTransactionSessionOption("transaction", "BUY");
            }}
            variant="primary"
            mode={
              transactionSession?.transaction === "BUY" ? "filled" : "ghost"
            }
            className={clsx("flex-1")}
          >
            <Button.Icon as={RiArrowLeftDownLine} /> Buy
          </Button.Root>
          <Button.Root
            onClick={() => {
              setTransactionSessionOption("transaction", "SELL");
            }}
            mode={
              transactionSession?.transaction === "SELL" ? "filled" : "ghost"
            }
            className="flex-1 "
            variant="error"
          >
            <Button.Icon as={RiArrowRightUpLine} /> Sell
          </Button.Root>
          <Button.Root
            className="flex-1"
            variant={
              transactionSession?.status === "RUNNING" ? "error" : "neutral"
            }
            mode="stroke"
            onClick={emitSessionStart}
          >
            {transactionSession?.status === "RUNNING" ? (
              <>
                <Button.Icon as={RiStopCircleLine} /> Stop
              </>
            ) : (
              <>
                <Button.Icon as={RiPlayCircleLine} /> Start
              </>
            )}
          </Button.Root>
        </div>
      </Card>
    </div>
  );
};

export default MainSidebar;
