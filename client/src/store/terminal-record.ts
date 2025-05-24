import { create } from "zustand";

export type TerminalRecord = {
    type: "error" | "info" | "warning" | "success";
    message: string;
    timestamp: number;
    id: string;
    log_type: "server" | "client";
}

export type LogType = {
    logs: TerminalRecord[]
}

export type LogTypes = {
    server: LogType,
    client: LogType,
}

type State = {
    logs: LogTypes;
    addLog: (type: "server" | "client", log: TerminalRecord) => void;
    clearLogs: (type: "server" | "client") => void;
    clearAllLogs: () => void;
    getLogs: (type: "server" | "client") => TerminalRecord[];
    setLogs: (type: "server" | "client", logs: TerminalRecord[]) => void;
    getAllLogs: () => TerminalRecord[];
}

const useTerminalRecordStore = create<State>((set, get) => ({
    logs: {
        server: { logs: [] },
        client: { logs: [] },
    },
    addLog: (type, log) => set((state) => {
        const updatedLogs = [...state.logs[type].logs, log];
        return {
            logs: {
                ...state.logs,
                [type]: { logs: updatedLogs },
            },
        };
    }
    ),
    clearLogs: (type) => set((state) => ({
        logs: {
            ...state.logs,
            [type]: { logs: [] },
        },
    })),
    clearAllLogs: () => set(() => ({
        logs: {
            server: { logs: [] },
            client: { logs: [] },
        },
    })),
    getLogs: (type) => {
        return get().logs[type].logs;
    }
    ,
    setLogs: (type, logs) => set((state) => ({
        logs: {
            ...state.logs,
            [type]: { logs: logs },
        }
    })),
    getAllLogs: () => {
        const { server, client } = get().logs;
        server.logs.sort((a, b) => b.timestamp - a.timestamp);
        client.logs.sort((a, b) => b.timestamp - a.timestamp);

        return [...server.logs, ...client.logs];
    }
}))

export default useTerminalRecordStore;  