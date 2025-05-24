import { LogTypes, TerminalRecord } from '@/store/terminal-record'
import React from 'react'
import { DateTime } from 'luxon'
import * as Badge from '@/components/ui/badge'
import clsx from 'clsx'

const TerminalLine = (props: { log: TerminalRecord, type: keyof LogTypes }) => {
    return (
        <div className={`flex  gap-2 flex-col border-b border-bg-soft-200`}>
            <div>
                {props.type === "server" && <Badge.Root color='gray' variant='light'>Server</Badge.Root>}
                {props.type === "client" && <Badge.Root color='blue'>Client</Badge.Root>}
                <span className='text-faded-base text-label-xs pl-[6px]'>{DateTime.fromMillis(props.log.timestamp).toFormat("dd/MM/yy HH:mm:ss")}</span>
            </div>
            <div className={clsx("text-label-sm", props.log.type === "error" && "text-red-500", props.log.type === "success" && "text-green-500", props.log.type === "info" && "text-blue-500", props.log.type === "warning" && "text-yellow-500", "text-label-sm")}>
                {props.log.message}
            </div>
        </div>
    )
}

export default TerminalLine