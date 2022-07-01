import { useEffect, useState } from "react";
import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider, extendTheme, Flex, Container, Box } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import ErrorBoundary from "./ErrorBoundary";
import { UserContextProvider } from "./store/UserContext";
import { ChainMetaContextProvider } from "./store/ChainMetaContext";
import { DappProvider, DappUI } from "@elrondnetwork/dapp-core";
import { BrowserRouter as Router } from 'react-router-dom';

import { MoralisProvider } from "react-moralis";

import { AuthLauncher } from "./AuthLauncher";
import EVMAppHarness from "./EVMAppHarness";
import ElrondAppHarness from "./ElrondAppHarness";
import AuthPickerEVM from './AuthPickerEVM';
import AuthPickerElrond from './AuthPickerElrond';

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

function Launcher() {
  const [launchMode, setLaunchMode] = useState('auth');
  const [lanchEnvironment, setLanchEnvironment] = useState('devnet');

  const handleLaunchMode = (option, environment) => {
    setLaunchMode(option);

    if (environment) {
      setLanchEnvironment(environment);
    }
  }

  return (
    <>
      <AuthLauncher onLaunchMode={handleLaunchMode} />

      {launchMode == 'evm' && <>
        <div>EVM Mode</div>
        <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
          <AuthPickerEVM />
          {/* <EVMAppHarness /> */}
        </MoralisProvider>
      </>}

      {launchMode == 'elrond' && <>
        <div>Elrond Mode</div>
        <DappProvider environment={lanchEnvironment} customNetworkConfig={{ name: "customConfig", apiTimeout: 6000 }}>
          <AuthPickerElrond />
          {/* <ElrondAppHarness /> */}
        </DappProvider>
      </>}
    </>
  );
}


export default Launcher;
