"use client";

import React, { PropsWithChildren, useState } from "react";
import * as Modal from "@/components/ui/modal";

import * as LinkButton from "@/components/ui/link-button";

import * as SegmentedControl from "@/components/ui/segmented-control";

import useModalStore from "../../store/modal-store";
import TerminalLine from "../terminal/terminal-line";
import useTerminalRecordStore from "@/store/terminal-record";

const TerminalModal = (props: PropsWithChildren) => {
  const { modal, closeAll } = useModalStore();

  const { getLogs, getAllLogs } = useTerminalRecordStore()



  const [tab, setTab] = useState<"server" | "client" | "all">("all")

  return (
    <Modal.Root
      open={modal === "terminal"}
      onOpenChange={(o) => {
        if (!o) {
          closeAll();
        }
      }}
    >
      <Modal.Trigger asChild>{props.children}</Modal.Trigger>
      <Modal.Content className="min-w-[60vw]" showClose={false}>
        <Modal.Header className="items-center justify-between flex px-4">
          <Modal.Title>Terminal</Modal.Title>
          <Modal.Close>
            <LinkButton.Root>
              Close
            </LinkButton.Root>
          </Modal.Close>
        </Modal.Header>
        <div className="flex flex-col">
          <SegmentedControl.Root defaultValue="all">
            <SegmentedControl.List>
              <SegmentedControl.Trigger
                value="all"
                onClick={() => {
                  setTab("all");
                }}
              >
                All
              </SegmentedControl.Trigger>
              <SegmentedControl.Trigger
                value="server"
                onClick={() => {
                  setTab('server');
                }}
              >
                Server
              </SegmentedControl.Trigger>
              <SegmentedControl.Trigger
                value="client"
                onClick={() => {
                  setTab('client');
                }}
              >
                Client
              </SegmentedControl.Trigger>
            </SegmentedControl.List>
          </SegmentedControl.Root>
          <div className="p-2 max-h-[60dvh] overflow-auto">
            {(tab === "all" ? getAllLogs() : getLogs(tab)).map((log) => {
              return (
                <TerminalLine
                  key={log.id}
                  log={log}
                  type={log.log_type}
                />
              );
            })}
          </div>
        </div>
      </Modal.Content>
    </Modal.Root >
  );
};

export default TerminalModal;
