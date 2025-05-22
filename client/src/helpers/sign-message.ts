import * as ethers from "ethers";
const signMessage = async (message: string) => {
  if (!window.ethereum) {
    return false;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const signature = await signer.signMessage(message);

  return signature;
};
export default signMessage;
