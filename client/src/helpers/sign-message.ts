import { ethers as ether } from 'ethers';
const signMessage = async (walletProvider: any, message: string) => {


  const provider = new ether.providers.Web3Provider(walletProvider, 8453);

  const signer = provider.getSigner();

  const signature = await signer.signMessage(message);

  return signature;
};
export default signMessage;
