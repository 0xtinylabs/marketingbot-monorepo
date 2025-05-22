export const getWalletString = (walletAddress: string) => {
  return (
    walletAddress.slice(0, 5) +
    "..." +
    walletAddress.slice(walletAddress.length - 2, walletAddress.length)
  );
};
