import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import {
  Button, Stack, Alert, AlertIcon, Box, AlertTitle, AlertDescription, 
  Text, Image, Link, Wrap, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, RadioGroup, Radio, Input,
  useDisclosure
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import walletConnect from './img/wallet-connect.png';
import walletMetamask from './img/wallet-metamask.png';
import chainElrond from './img/elrond-chain-logo.png';
import walletWeb3Auth from './img/wallet-web3auth.png';
import logo from './img/logo.png';
import { hardReload } from './libs/util';
import { WEB3_AUTH_SUPPORTED_CHAINS, CHAINS, WALLETS } from './libs/util';

export const Auth = ({handleSetLoggedInWalletProvider}) => {
  const { authenticate, isAuthenticating, authError, isAuthenticated, Moralis } = useMoralis();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const [authErrorUi, setAuthErrorUi] = useState(null);
  const [walletUsed, setWalletUsed] = useState(WALLETS.METAMASK);
  const [isAuthenticatingMetamask, setIsAuthenticatingMetamask] = useState(0);
  const [isAuthenticatingElrond, setIsAuthenticatingElrond] = useState(0);

  useEffect(() => {
    if (authError) {
      setWalletUsed(WALLETS.METAMASK);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingElrond(0);
      setAuthErrorUi(authError);      
    }
  }, [authError]);


  useEffect(() => {
    if (isAuthenticating) {
      switch(walletUsed) {    
        case WALLETS.ELROND:
          setIsAuthenticatingElrond(1);
          break;
  
        case WALLETS.METAMASK:
          setIsAuthenticatingMetamask(1);
          break;
      }
    } else {
      // this will trigger when the user login and logsout -- so it's like a ui reset 
      // ... (but we cant reset error as we need to show this)
      setWalletUsed(WALLETS.METAMASK);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingElrond(0);
    }
  }, [isAuthenticating]);

  const handleProgressModalClose = () => {
    setAuthErrorUi(null);
    onProgressModalClose();
  }

  const handleAuthenticate = (wallet, web3AuthChain) => {
    setAuthErrorUi(null);

    switch(wallet) {      
      case WALLETS.METAMASK:
        setWalletUsed(WALLETS.METAMASK);
        authenticate();
        break;

      case WALLETS.WC:
        setWalletUsed(WALLETS.WC);
        authenticate({ 
          provider: "walletconnect",
        });
        
        break;

      case WALLETS.ELROND:
        setWalletUsed(WALLETS.ELROND);
        authenticate({ type: "erd" });
        break;

      case WALLETS.WEB3AUTH:
        setWalletUsed(WALLETS.WEB3AUTH);
        authenticate({ 
          provider: "web3Auth",
          clientId: process.env.REACT_APP_ENV_WEB3AUTH_CLIENTID,
          chainId: web3AuthChain,
          appLogo: logo
        });
        break;
    }

    handleSetLoggedInWalletProvider(wallet);
  }
  
  return (
    <Stack spacing={6} p="5">
      <HStack justify={"center"}>
        <Button onClick={onProgressModalOpen}>
          <Image src={walletMetamask} boxSize={"20px"} mr="1" />
          <Image src={walletConnect} boxSize={"25px"} mr="2" />
          Connect a Crypto Wallet
        </Button>
        <Box>
        
        <PopupChainSelectorForWallet 
          actionTxt={"Web3Auth Social Login"}
          walletToUse={WALLETS.WEB3AUTH}
          actionImg={walletWeb3Auth}
          onAuthenticate={handleAuthenticate}  />

        </Box>
      </HStack>

      <Modal size="xl"
        isOpen={isProgressModalOpen}
        onClose={handleProgressModalClose}
        closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing="5">

              <Text fontSize="sm">Please select a wallet to connect to the Data DEX</Text>              

              {authErrorUi && (
                <Alert status="error">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle fontSize="md">Authentication has failed</AlertTitle>
                    <AlertDescription fontSize="md" display="block">
                      {authErrorUi.message}
                    
                      <Text d="block" mt="3">
                        {'>'} <Link onClick={hardReload}>Reload page to try again</Link>
                      </Text>
                    </AlertDescription>
                  </Box>         
                </Alert>
              )}
              
              <Box p="15px">
                <Wrap spacing="20px" justify="space-between">
                  <Box>
                    <Button isLoading={Boolean(isAuthenticatingMetamask)} onClick={() => handleAuthenticate(WALLETS.METAMASK)} width="220px" p="8">
                      <Image src={walletMetamask} boxSize="40px" borderRadius="lg" mr="2" />
                      <Text>MetaMask</Text>
                    </Button>
                  </Box>

                  <Box>
                    <PopupChainSelectorForWallet 
                      actionTxt={"WalletConnect" }
                      actionImg={walletConnect}
                      walletToUse={WALLETS.WC}
                      lrgButtonSize={true}
                      hideTerms={true}
                      onAuthenticate={handleAuthenticate} />
                  </Box>

                  <Box display="none">
                    <Button isLoading={Boolean(isAuthenticatingElrond)} onClick={() => handleAuthenticate(WALLETS.ELROND)} width="220px" p="8">
                      <Image src={chainElrond} boxSize="40px" borderRadius="lg" mr="2" />
                      Elrond via Ledger
                    </Button>
                  </Box>
                </Wrap>
              </Box>

              <Text fontSize="sm">By logging in, you are agreeing to the <Link href="https://itheum.com/termsofuse" isExternal>Terms of Use <ExternalLinkIcon mx="2px" /></Link> & <Link href="https://itheum.com/privacypolicy" isExternal>Privacy Policy <ExternalLinkIcon mx="2px" /></Link></Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};


const PopupChainSelectorForWallet = ({actionTxt, actionImg, walletToUse, lrgButtonSize, hideTerms, onAuthenticate}) => {
  // web3auth config
  const [showWeb3AuthChainPicker, setShowWeb3AuthChainPicker] = useState(false);
  const [web3AuthChain, setWeb3AuthChain] = useState(WEB3_AUTH_SUPPORTED_CHAINS[0]); // default to a chain

  return (
    <Popover
      isOpen={showWeb3AuthChainPicker}
      onOpen={() => setShowWeb3AuthChainPicker(true)}
      onClose={() => setShowWeb3AuthChainPicker(false)}
      closeOnBlur={true}
      isLazy
      lazyBehavior='keepMounted'>
        <HStack>              
          <PopoverTrigger>
            <Button width={lrgButtonSize && "220px"} p={lrgButtonSize && "8"}>
              <Image src={actionImg} boxSize={lrgButtonSize ? "40px" : "20px"} mr="2" />
              <Text>{actionTxt}</Text>  
            </Button>
          </PopoverTrigger>
        </HStack>

        <PopoverContent>
          <PopoverBody>
            <Text fontSize="sm" mt="2" mb="2">Please pick a supported blockchain</Text>
              <RadioGroup value={web3AuthChain} onChange={(newChainId) => setWeb3AuthChain(parseInt(newChainId,10))}>
                {WEB3_AUTH_SUPPORTED_CHAINS.map(i => <Radio key={i} value={i} p="1"><Text fontSize="sm">{CHAINS[i]}</Text></Radio>)}
              </RadioGroup>

              {!hideTerms && <Text fontSize="sm" mt="2">By logging in, you are agreeing to the <Link href="https://itheum.com/termsofuse" isExternal>Terms of Use <ExternalLinkIcon mx="2px" /></Link> & <Link href="https://itheum.com/privacypolicy" isExternal>Privacy Policy <ExternalLinkIcon mx="2px" /></Link></Text>}
              
              <Button mt="4" onClick={() => {
                setShowWeb3AuthChainPicker(false); 
                onAuthenticate(walletToUse, web3AuthChain);
              }}> Login </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
};
