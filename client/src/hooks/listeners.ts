// Just use and add once for prevent conflicts

import api from "@/service/api"
import useUserStore from "@/store/user-store"
import useWalletStore from "@/store/wallet"
import { useAppKitAccount } from "@reown/appkit/react"
import { useEffect, useRef } from "react"

const useListener = () => {

    const { user } = useUserStore()

    const { address } = useAppKitAccount()
    const { setWallets, resetSelectedWallets } = useWalletStore()
    const refresh_interval = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        if (address) {

            refresh_interval.current = setInterval(async () => {
                api.getAllWallets(user?.wallet_address ?? address).then(res => {
                    setWallets(res.wallets)
                    resetSelectedWallets(res.wallets)
                })
            }, 5000)
        }
        else {
            if (refresh_interval.current) {
                clearInterval(refresh_interval.current)
            }
            setWallets([])

        }
        return () => {
            if (refresh_interval.current) {

                clearInterval(refresh_interval.current)
            }
        }

    }, [address])


}

export default useListener