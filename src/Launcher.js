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
      <div>launchMode {launchMode}</div>
      
      {launchMode == 'auth' && 
        <AuthLauncher onLaunchMode={handleLaunchMode} />
      }

      {launchMode == 'evm' && <>
        <div>EVM Mode</div>
        <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
          <AuthPickerEVM resetLaunchMode={() => setLaunchMode('auth')} />
          <EVMAppHarness resetLaunchMode={() => setLaunchMode('auth')} />
        </MoralisProvider>
      </>}

      {launchMode == 'elrond' && <>
        <div>Elrond {lanchEnvironment} Mode</div>
        <DappProvider environment={lanchEnvironment} customNetworkConfig={{ name: "customConfig", apiTimeout: 6000 }}>
          <AuthPickerElrond resetLaunchMode={() => setLaunchMode('auth')} />
          <ElrondAppHarness resetLaunchMode={() => setLaunchMode('auth')} />
        </DappProvider>
      </>}
    </>
  );
}


export default Launcher;
