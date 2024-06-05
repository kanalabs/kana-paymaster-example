"use client";
import {
  useWallet,
  AptosWalletAdapterProvider,
} from "@aptos-labs/wallet-adapter-react";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { ReactNode, useMemo } from "react";

export const useAptosContext = useWallet;

export const AptosWalletProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(
    () => [new PetraWallet(), new MartianWallet(), new FewchaWallet, new PontemWallet, new RiseWallet],

    []
  );
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      onError={(error) => {
        console.log("Custom error handling", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default AptosWalletProvider;
