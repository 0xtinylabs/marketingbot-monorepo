import useTerminalRecordStore from "@/store/terminal-record"
import { useEffect } from "react"

const useIpcListener = () => {

    const { addLog } = useTerminalRecordStore()

    const listForTerminalLogs = async () => {

        window.electron.receive("log", (data) => {
            addLog(data.type, { ...data.log, log_type: data.type })
        })
    }

    useEffect(() => {
        listForTerminalLogs()
    }, [])

}

export default useIpcListener