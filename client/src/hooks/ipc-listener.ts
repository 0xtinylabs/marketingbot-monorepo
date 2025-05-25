import useTerminalRecordStore from "@/store/terminal-record"
import useUpdate from "@/store/update"
import { useEffect } from "react"

const useIpcListener = () => {

    const { addLog } = useTerminalRecordStore()

    const { setAvailable } = useUpdate()




    const listenForUpdates = () => {
        window.electron.receive("update", () => {
            console.log("Update available")
            setAvailable(true)
        })
    }

    const listForTerminalLogs = async () => {

        window.electron.receive("log", (data) => {
            addLog(data.type, { ...data.log, log_type: data.type })
        })
    }

    useEffect(() => {
        listForTerminalLogs()
        listenForUpdates()
    }, [])

}

export default useIpcListener