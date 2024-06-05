"use client";
import React from "react";
import Image from "next/image";
import Kanalogo from "../assest/kana_logo.svg";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
const Navbar = () => {
  return (
    <div>
      <div
        className={` !bg-[black] h-[5.5rem] z-[1]  !fixed !top-0 flex flex-col justify-between items-start !font-inter   xxl:!rounded-[0_0_1rem_1rem] bxl:!rounded-[0_0_1rem_1rem] xl:!rounded-[0_0_1rem_1rem] sxl:!rounded-[0_0_1rem_1rem] lg:!rounded-[0rem] md:!rounded-[0rem] sm:!rounded-[0rem] xd:!rounded-[0rem] w-full `}
      >
        <div className="!h-24 flex flex-row  items-center justify-between  w-full xxl:!px-[1.5rem] bxl:!px-[1.5rem] xl:!px-[1.5rem] sxl:!px-[1.5rem] lg:!pr-[1.5rem] md:!pr-[0rem] sm:!pr-[0rem] xd:!pr-[0rem] ">
          <Image src={Kanalogo} alt="Kanalogo" />
          <div className=" flex justify-between">
            <div className=" ml-6">
              <WalletSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
