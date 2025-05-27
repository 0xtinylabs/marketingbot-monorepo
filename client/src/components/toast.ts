import { toast as ModuleToast, ToastOptions, ToastType, } from "react-hot-toast"

const ctoast = (message: string, variant: ToastType, options?: ToastOptions) => {

    const params = {

        style: {
            backgroundColor: "rgb(var(--bg-white-0))",
            border: "rgb(var(--stroke-soft-200)) 1px solid",
            borderRadius: 10,
            color: "rgb(var(--text-strong-950))"
        },
        ...options
    }
    if (variant === "error") {
        return ModuleToast.error(message, params)
    }
    if (variant === "loading") {
        return ModuleToast.loading(message, params)
    }
    if (variant === "success") {
        return ModuleToast.success(message, params)
    }
    if (variant === "blank") {
        return ModuleToast(message, params)
    }


}

export default ctoast