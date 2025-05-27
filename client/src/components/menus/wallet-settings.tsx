import React from "react";
import * as Dropdown from "@/components/ui/dropdown";
import {
  RiCrosshair2Line,
  RiLockPasswordLine,
  RiSendPlaneFill,
  RiWalletLine,
} from "@remixicon/react";
import useModalStore from "../../store/modal-store";
import useDownload from "@/hooks/download";

const WalletSettingsMenu = () => {
  const { setModal } = useModalStore();
  const { downloadWallets } = useDownload();

  return (
    <Dropdown.Root >
      <Dropdown.Trigger asChild className="cursor-pointer">
        <div className="text-text-sub-600 text-label-xs hover:underline ">Settings</div>
      </Dropdown.Trigger>
      <Dropdown.Content side="bottom" align="end" >
        <Dropdown.Item
          onSelect={() => {
            setModal("add-wallet");
          }}
        >
          <>
            <Dropdown.ItemIcon as={RiWalletLine} />
            Add New
          </>
        </Dropdown.Item>
        <Dropdown.Item
          onSelect={() => {
            setModal("target-token");
          }}
        >
          <Dropdown.ItemIcon as={RiCrosshair2Line} />
          Target a token
        </Dropdown.Item>
        <Dropdown.Item
          onSelect={() => {
            setModal("withdraw");
          }}
        >
          <Dropdown.ItemIcon as={RiSendPlaneFill} />
          Withdraw
        </Dropdown.Item>
        <Dropdown.Item
          onSelect={(e) => {
            e.preventDefault();
            downloadWallets();
          }}
        >
          <Dropdown.ItemIcon as={RiLockPasswordLine} />
          Download
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default WalletSettingsMenu;
