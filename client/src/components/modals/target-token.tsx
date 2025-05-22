"use client";

import React, { PropsWithChildren, useState } from "react";
import * as Modal from "@/components/ui/modal";

import * as Input from "@/components/ui/input";

import * as Button from "@/components/ui/button";

import { NumberField as ReactAriaNumberField } from "react-aria-components";

import useModalStore from "../../store/modal-store";
import useUserStore from "@/store/user-store";
import useUser from "@/hooks/use-user";

const TargetTokenModal = (props: PropsWithChildren) => {
  const { modal, closeAll } = useModalStore();

  const { user } = useUserStore();

  const { setUserToken } = useUser();

  const [token_address, setTokenAddress] = useState("");

  console.log(modal);

  return (
    <Modal.Root
      open={modal === "target-token"}
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
          <div className={"group"}>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  onChange={(e) => {
                    setTokenAddress(e.target.value);
                  }}
                  placeholder="Add CA to start trading..."
                />
              </Input.Wrapper>
            </Input.Root>
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
                setUserToken(user.wallet_address, token_address);
                closeAll();
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

export default TargetTokenModal;
