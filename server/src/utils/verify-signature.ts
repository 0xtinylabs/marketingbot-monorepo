import { ethers } from 'ethers';

const verifySignature = (
  wallet_address: string,
  message: string,
  signature: string,
) => {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return wallet_address.toLowerCase() === recoveredAddress.toLowerCase();
};

export default verifySignature;
