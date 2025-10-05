import { create, useStore } from "zustand";

interface MainState {
    storm: boolean
    loadingProgress: number
    isLoading: boolean
    isRedirecting: boolean
}

interface MainStore {
    data: MainState
    fnOnChange: <K extends keyof MainState>(
        field: K,
        value: MainState[K]
    ) => void
    fnReset: () => void
}


const stateDefault: MainState = {
    storm: false,
    loadingProgress: 0,
    isLoading: true,
    isRedirecting: false
}

const mainStore = create<MainStore>((set) => ({
    data: { ...stateDefault },
    fnOnChange: (field, value) => {
        set((prevState) => ({
            ...prevState,
            data: { ...prevState.data, [field]: value },
        }))
    },
    fnReset: () => {
        set((prevState) => ({
            ...prevState,
            data: { ...stateDefault },
        }))
    }
}))

export const useMainStore = () => {
    return useStore(mainStore)
}