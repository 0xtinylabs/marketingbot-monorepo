"use client";

import React, { PropsWithChildren } from "react";
import * as Modal from "@/components/ui/modal";

import * as Button from "@/components/ui/button";

import { NumberField as ReactAriaNumberField } from "react-aria-components";

import useModalStore from "../../store/modal-store";
import useWalletStore from "../../store/wallet";

const WithdrawModal = (props: PropsWithChildren) => {
  const { modal, closeAll } = useModalStore();


  const { selectedWallets } = useWalletStore();

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
        <ReactAriaNumberField
          defaultValue={10}
          minValue={0}
          className="flex flex-col gap-1 !m-6"
        >
          <div>{selectedWallets.length} Wallet Selected</div>
        </ReactAriaNumberField>
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
          <Button.Root size="small" className="w-full">
            Withdraw
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default WithdrawModal;
