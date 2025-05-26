import useStatusStore from "@/store/status"
import useTerminalRecordStore from "@/store/terminal-record"
import useUpdate from "@/store/update"
import { useEffect } from "react"

const useIpcListener = () => {

    const { addLog } = useTerminalRecordStore()

    const { setAvailable } = useUpdate()
    const { setStatus } = useStatusStore()




    const listenForUpdates = () => {
        window.electron.receive("update", () => {
            console.log("Update available")
            setAvailable(true)
        })
    }

    const listnForServerStatus = () => {
        window.electron.receive("server-down", () => {
            setStatus("down")
        })
        window.electron.receive("server-up", () => {
            setStatus("up")
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
        listnForServerStatus()
    }, [])

}

export default useIpcListener