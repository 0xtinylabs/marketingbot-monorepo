import { toast as ModuleToast, ToastOptions, ToastType, } from "react-hot-toast"

const ctoast = (message: string, variant: ToastType, options?: ToastOptions) => {
    const params = {

        className: "bg-white-0 border-[1px] border-text-soft-200",
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