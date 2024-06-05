"use client";
import Image from "next/image";
import Navbar from "./Components/Navbar";
import instructor from "./assest/Vector.svg";
import DropDown from "./assest/dropdown.svg";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Aptos,
  AptosConfig,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { PaymasterSdk } from "@kanalabs/paymaster-sdk";
import { tokenList } from "./Components/aptosTokenList";
import { apikey } from "./utils/constants";

export default function Home() {
  const { signTransaction, account, connected } = useWallet();
  const [aptos, setAptos] = useState<Aptos | any>();
  const [sdk, setSdk] = useState<PaymasterSdk>();
  const [txnStatus, setTxnStatus] = useState<string>();
  const [hash, setHash] = useState<any>();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState<any>();
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(
    null
  );
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<any>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    /**
     * add the network
     * initialize paymaster sdk
     * pass the apikey
     */

    const aptosConfig = new AptosConfig({
      network: Network.MAINNET,
    });
    const aptos = new Aptos(aptosConfig);
    setAptos(aptos);
    const sdk = new PaymasterSdk(
      { privateKey: undefined },
      {
        projectKey: apikey,
      }
    );
    setSdk(sdk);
  }, []);

  const getUserTokens = async () => {
    /**
     * get the user account coins data
     */
    const accountCoinData = await aptos.getAccountCoinsData({
      accountAddress: account?.address,
    });
    setUserTokens(accountCoinData);
  };

  useEffect(() => {
    if (connected) {
      getUserTokens();
    }
  }, [connected, account?.address]);

  const transfer = async (recipientAddress: string, amount: string) => {
    /**
     * transfer method
     * @param  recipientAddress - address
     * @param amount - amount
     */

    if (!aptos) return;
    if (!account) return;

    /**
     * need to build a payload
     */

    const transaction: any = await aptos.transaction.build.simple({
      sender: account?.address,
      withFeePayer: true,
      data: {
        function: "0x1::coin::transfer",
        functionArguments: [recipientAddress, amount],
        typeArguments: [selectedAssetType],
      },
    });

    /**
     * It will check if the address is whitelisted or not if it not it is whitelist the address
     */
    const isWhitelisted = await sdk?.isWhitelisted({
      address: account?.address,
    });
    console.log("isWhitelisted", isWhitelisted);
    if (!(isWhitelisted?.message == "whitelisted")) {
      console.log(
        await sdk?.addToWhitelist({
          address: account?.address,
        })
      );
    }

    /**
     * sign the transactions
     */
    const senderAuthenticator: any = await signTransaction(transaction, false);
    console.log(senderAuthenticator);

    /**
     * For the sponsorTxn you need to use this method
     */

    const sponsor = await sdk?.sponsoredTxnWithSenderAuth({
      transaction: transaction,
      senderAuth: senderAuthenticator,
    });
    if (!sponsor) throw new Error("Sponsorship failed");

    /**
     * need to wait for the transactions to complete if the success is true it will return the hash and status
     */

    const txnreceipt = (await sdk?.aptosClient.waitForTransaction({
      transactionHash: sponsor?.hash,
      options: { checkSuccess: true },
    })) as UserTransactionResponse;
    setHash(sponsor?.hash);
    setTxnStatus(txnreceipt?.vm_status);
  };

  const handleSignTransaction = () => {
    transfer(recipientAddress, amount)
  };

  const handleTokenSelect = (
    tokenName: any,
    amount: any,
    assetType: any,
    decimals: any
  ) => {
    setSelectedAssetType(assetType);
    setSelectedToken(tokenName);
    setSelectedAmount(amount / 10 ** decimals);
    setIsOpen(false);
  };

  return (
    <main className="paymaster-bg">
      <div>
        <Navbar />
      </div>
      {!connected ? (
        <div className="flex justify-center items-center align-middle font-[800] text-[5rem] text-white">
          <div className="relative my-[15rem]">Paymaster Example</div>
        </div>
      ) : (
        <>
          <div className="h-auto w-full bg-[rgba(0,0,0,0.20)] flex flex-row justify-center sm:items-end xd:items-end pt-[10rem]">
            <div className="2xl:w-[35rem] bxl:w-[35rem] xl:w-[35rem] sxl:w-[35rem] lg:w-[35rem] md:w-[35rem] sm:w-[25rem] xd:w-[25rem] max-sm:w-[21rem] h-[25rem] bg-[rgba(23,24,26,0.50)] border-[rgba(255,255,255,0.10)] backdrop-blur-[54.36563491821289px] border-2 rounded-[1rem]">
              <div className=" rounded-[1rem]  ">
                <div className="flex bg-[#17181A] w-full border-b-2 rounded-t-[1rem] border-[#ffffff1a] h-[3.5rem] p-4">
                  <Image src={instructor} alt="instructor" className=" mt-1" />
                  <div className=" text-[1rem] font-[800] px-1">
                    Instruction
                  </div>
                </div>
                <div className=" py-2 overflow-auto h-[20rem]">
                  <div className="pl-2 py-2 text-[#777879]">
                    <ul>
                      <li className=" flex ">
                        <span>1.</span>
                        <span className="px-2 flex flex-col">
                          <span>
                            <span className=" font-[700] text-white">
                              Registration:
                            </span>
                            <span className=" px-1">
                              First, register at the following link:
                            </span>
                          </span>
                          <a
                            href="https://aptos-paymaster.kanalabs.io/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" text-[#2ED3B7] font-[700]"
                          >
                            https://aptos-paymaster.kanalabs.io/dashboard
                          </a>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>2.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            API Key and Fee Payer Account:
                          </span>
                          <span className=" px-1">
                            After completing the registration, you will receive
                            an API key and a fee payer account.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>3.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Deposit Funds:
                          </span>
                          <span className=" px-1">
                            Deposit funds into the fee payer account.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>4.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Whitelist Address:
                          </span>
                          <span className=" px-1">
                            Whitelist the address to enable sponsored
                            transactions.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>5.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Build and Send Transaction:
                          </span>
                          <span className=" px-1">
                            The dApp constructs a transaction and sends it to
                            KanaLabs Paymaster for the sponsor’s signature.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>6.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Receive Signature:
                          </span>
                          <span className=" px-1">
                            The paymaster returns the signature, signed by the
                            dApps dedicated fee payer wallet.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>7.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Add Users Signature:
                          </span>
                          <span className=" px-1">
                            The dApp adds the users signature and submits the
                            transaction to the Aptos blockchain.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>8.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Initialize Paymaster SDK:
                          </span>
                          <span className=" px-1">
                            Copy the API key from your dashboard and use it to
                            initialize the paymaster SDK.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>9.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Initiate Transfer:
                          </span>
                          <span className=" px-1">
                            Begin by accessing the transfer method interface.
                          </span>
                        </span>
                      </li>
                      <li className=" flex">
                        <span>10.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Select Asset:
                          </span>
                          <span className=" px-1">
                            Choose the asset you wish to transfer from your
                            available options.
                          </span>
                        </span>
                      </li>
                      <li className=" flex pt-2">
                        <span>11.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Enter Recipient Address:
                          </span>
                          <span className=" px-1">
                            Input the address of the recipient to whom you want
                            to transfer the asset.
                          </span>
                        </span>
                      </li>
                      <li className=" pt-2">
                        <div className=" flex">
                          <span>12.</span>
                          <span className=" px-2">
                            <span className=" font-[700] text-white">
                              Specify Amount:
                            </span>
                            <span className=" px-1">
                              Enter the amount of the asset you intend to
                              transfer. Note the following conversion
                              requirements:
                            </span>
                          </span>
                        </div>
                        <div className=" px-8 pt-1">
                          <ul>
                            <li>
                              For transferring 1 APT, enter the amount as
                              100000000.
                            </li>
                            <li>
                              For transferring 1 USDC, enter the amount as
                              1000000.
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className=" flex pt-2">
                        <span>13.</span>
                        <span className=" px-2">
                          <span className=" font-[700] text-white">
                            Execute Transfer:
                          </span>
                          <span className=" px-1">
                            Click the Transfer button. Kana Paymaster will
                            handle the transaction, including covering the gas
                            fees for the transfer.
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="2xl:w-[35rem] bxl:w-[35rem] xl:w-[35rem] sxl:w-[35rem] lg:w-[35rem] md:w-[35rem] sm:w-[25rem] xd:w-[25rem] max-sm:w-[21rem] h-[25rem] bg-[rgba(23,24,26,0.50)] border-[rgba(255,255,255,0.10)] backdrop-blur-[54.36563491821289px] border-2 rounded-[1rem] ml-4">
              <div className="flex justify-center relative my-8">
                <div
                  className="flex justify-between bg-black outline-none w-[85%] rounded-[0.5rem] h-[3.5rem] p-[0%_1%] cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <div className="text-[1rem] p-[2%_0%] font-[800] bg-transparent flex justify-between w-[95%]">
                    {selectedToken ? `${selectedToken}` : "Select asset"}
                    <div>{selectedAmount}</div>
                  </div>
                  <Image src={DropDown} alt="DropDown" />
                </div>
                {isOpen && (
                  <div className="absolute z-10 mt-16 w-[85%] h-[11rem] rounded-[0.5rem] shadow-lg bg-[black] border-[rgba(255,255,255,0.10)] border-2 focus:outline-none overflow-auto font-[800] custom-scrollbar">
                    <div className="py-1">
                      {userTokens.map((coin, index) => {
                        const token = tokenList.find(
                          (token) => token.token_type.type === coin.asset_type
                        );
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleTokenSelect(
                                token?.name,
                                coin?.amount,
                                coin?.asset_type,
                                coin?.metadata?.decimals
                              )
                            }
                            className="block px-4 py-2 text-sm text-white hover:bg-slate-700 hover:rounded-[0.5rem] cursor-pointer leading-9"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex">
                                {token && (
                                  <img
                                    src={token.logo_url}
                                    alt={token.name}
                                    className="w-6 h-6 mr-2 mt-1"
                                  />
                                )}
                                <span>{token?.name} </span>
                              </div>
                              <div>
                                {coin?.amount / 10 ** coin?.metadata?.decimals}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center my-8">
                <input
                  type="text"
                  placeholder="Enter the recipient address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="text-[1rem] font-[800] w-[85%] rounded-[0.5rem] h-[3.5rem] px-5 bg-black outline-none"
                />
              </div>
              <div className="flex justify-center my-8">
                <input
                  type="text"
                  placeholder="Enter the amount"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="text-[1rem] font-[800] w-[85%] rounded-[0.5rem] h-[3.5rem] px-5 bg-black outline-none"
                />
              </div>

              <div className="flex justify-center my-12">
                <button
                  className="buy-button w-[85%]"
                  onClick={handleSignTransaction}
                >
                  <div className="buy-button-inner !h-[56px] text-[#2ED3B7] text-[1rem] font-manrope font-[800]">
                    Transfer
                  </div>
                </button>
              </div>
            </div>
          </div>
          {hash?.length > 0 && (
            <div className="flex justify-center items-center align-middle mt-3">
              <div className="bg-[rgba(23,24,26,0.50)] border-[rgba(255,255,255,0.10)] backdrop-blur-[54.36563491821289px] border-2 w-[55rem] h-[6rem] rounded-[0.5rem] text-white text-[1rem] font-[600] p-6">
                <div>txnStatus: {txnStatus}</div>
                <div>
                  hash:
                  <a
                    href={`https://explorer.aptoslabs.com/txn/${hash}?network=mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hash}
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
