import { isSupportedChain } from "../utils";
import { getProvider } from "../constants/providers";
import { getProposalsContract } from "../constants/contracts";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { isAddress } from "ethers";
import { useCallback } from "react";
import { toast } from "react-toastify";

const useDelegateVote = (address) => {
  const { chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  return useCallback(async () => {
    if (!isSupportedChain(chainId)) return console.error("Wrong network");
    if (!isAddress(address)) return console.error("Invalid address");
    const readWriteProvider = getProvider(walletProvider);
    const signer = await readWriteProvider.getSigner();

    const contract = getProposalsContract(signer);

    try {
      const transaction = await contract.delegate(address);
      console.log("transaction: ", transaction);
      const receipt = await transaction.wait();

      console.log("receipt: ", receipt);

      if (receipt.status) {
        return toast.success("delegated successfull!");
      }

      toast.error("delegation failed!");
    } catch (error) {
      console.log(error);
      let errorText;
      if (error.reason === "Self-delegation is disallowed.") {
        errorText = "You cannot delegate yourself";
      } else if (error.reason === "You already voted.") {
        errorText = "You have already voted";
      } else if (error.reason === "Found loop in delegation.") {
        errorText = "Operation not allowed";
      } else {
        errorText = "An unknown error occured";
      }

      toast.error(`error:  ${errorText}`);
    }
  }, [address, chainId, walletProvider]);
};

export default useDelegateVote;
