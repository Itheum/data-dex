import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetBitz from ".";
import { EXPLORER_APP_FOR_TOKEN } from "libs/config";
import { getChainID } from "@multiversx/sdk-dapp/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccountStore } from "store";
import { LuFlaskRound } from "react-icons/lu";
import { useColorMode } from "@chakra-ui/react";

type PathwaysModalProps = {
  showPlayBitzModel?: boolean;
  handleHideBitzModel?: any;
};

export const PlayBitzModal: React.FC<PathwaysModalProps> = (props) => {
  const { showPlayBitzModel, handleHideBitzModel } = props;
  const { connected } = useWallet();
  const bitzBalance = useAccountStore((state: any) => state.bitzBalance);
  const { colorMode } = useColorMode();

  // add the dark class for tailwind css
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.toggle(colorMode);
  }, [colorMode]);

  return (
    <div
      id="static-modal"
      aria-hidden="true"
      className={`${showPlayBitzModel ? "visible" : "hidden"} flex mt-[-50px] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 bg-[#000000d9]`}>
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg dark:bg-[#171717] drop-shadow-[0_0px_100px_rgba(250,250,250,.8)]">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Play To Get {connected ? " SOL " : " MVX "} BiTz XP</h3>
            <div className="flex flex-row text-gray-900 dark:text-white ">
              {bitzBalance === -2 ? <span>...</span> : <>{bitzBalance === -1 ? <div>0</div> : <div>{bitzBalance}</div>}</>}
              <LuFlaskRound fontSize={"1.4rem"} fill="#38bdf8" />
            </div>
            <div>
              <Link target="_blank" to={`${EXPLORER_APP_FOR_TOKEN[getChainID()]["bitzgame"]}`} onClick={handleHideBitzModel}>
                <button className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Open Full BiTz Game App
                  </span>
                </button>
              </Link>
              <button
                type="button"
                className="text-gray-400 ml-2 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={handleHideBitzModel}
                data-modal-hide="static-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
          </div>
          <div className="min-h-[23rem]">
            <GetBitz modalMode={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
