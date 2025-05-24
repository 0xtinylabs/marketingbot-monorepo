import useTokenStore from "@/store/token-store";
import useWalletStore from "@/store/wallet";
import clsx from "clsx";

const WalletsContainer = () => {
  const { wallets, selectedWallets, toggleWallet } = useWalletStore();

  const { token } = useTokenStore()

  return (
    <div className="flex-1 overflow-hidden basis-0 flex">
      <div className="flex flex-col flex-1 overflow-auto">
        {wallets.map((wallet) => (
          <div
            onClick={() => {
              toggleWallet(wallet.address);
            }}
            className={clsx(
              "flex justify-between items-center px-2 py-2 border-bg-soft-200 border-[1px] mb-2 rounded-lg",
              selectedWallets.find((w) => w.address === wallet.address)
                ? "border-primary-base"
                : ""
            )}
            key={wallet.address}
          >
            <span className="text-text-soft-400 text-label-sm">
              W{wallet.index}
            </span>
            <div className="flex text-text-soft-400 gap-x-2">
              <div>
                <span className="text-text-strong-950">
                  ${wallet.total_eth ?? 0}
                </span>{" "}
                ETH
              </div>
              <div>/</div>
              <div>
                <span className="text-text-strong-950">
                  ${wallet.token_usd ?? 0}
                </span>{" "}
                {token?.ticker ?? ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletsContainer;
