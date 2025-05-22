"use client";

import React, { PropsWithChildren, useState } from "react";
import * as Modal from "@/components/ui/modal";

import { RiAddLine, RiSubtractLine } from "@remixicon/react";

import * as Button from "@/components/ui/button";

import {
  Button as ReactAriaButton,
  Group as ReactAriaGroup,
  Input as ReactAriaInput,
  NumberField as ReactAriaNumberField,
} from "react-aria-components";
import { inputVariants } from "../ui/input";

import { compactButtonVariants } from "@/components/ui/compact-button";
import useModalStore from "../../store/modal-store";
import useUser from "@/hooks/use-user";
import useUserStore from "@/store/user-store";
import toast from "react-hot-toast";

const AddWalletsModal = (props: PropsWithChildren) => {
  const { root: inputRoot, wrapper: inputWrapper, input } = inputVariants();
  const { root: compactButtonRoot, icon: compactButtonIcon } =
    compactButtonVariants({ variant: "ghost" });

  const { modal, closeAll } = useModalStore();

  const { createWallets } = useUser();

  const [count, setCount] = useState(0);

  const { user } = useUserStore();

  return (
    <Modal.Root
      open={modal === "add-wallet"}
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
          onChange={(value) => {
            setCount(value);
          }}
          className="flex flex-col gap-1 !m-6"
        >
          <div className={inputRoot()}>
            <ReactAriaGroup className={inputWrapper()}>
              <ReactAriaButton slot="decrement" className={compactButtonRoot()}>
                <RiSubtractLine className={compactButtonIcon()} />
              </ReactAriaButton>
              <ReactAriaInput className={input({ class: "text-center" })} />
              <ReactAriaButton slot="increment" className={compactButtonRoot()}>
                <RiAddLine className={compactButtonIcon()} />
              </ReactAriaButton>
            </ReactAriaGroup>
          </div>
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
          <Button.Root
            onClick={async () => {
              if (user?.wallet_address) {
                try {
                  await createWallets(user?.wallet_address, count);
                  toast("Successfully added wallets");
                  closeAll();
                } catch {}
              }
            }}
            size="small"
            className="w-full"
          >
            Add
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AddWalletsModal;
