import { create } from "zustand"

type State = {
    showGraph: boolean,
    setShowGraph: (showGraph: boolean) => void,
    toggleGraph: () => void
}

const useAppSettingsStore = create<State>((set, get) => ({
    setShowGraph: (showGraph) => set({ showGraph }),
    showGraph: false,
    toggleGraph: () => set({ showGraph: !(get().showGraph) })
}))

export default useAppSettingsStore