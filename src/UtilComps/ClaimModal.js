import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Spacer,useToast,
  Button,
  Link,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,Stack
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ShortAddress from "../UtilComps/ShortAddress";
import React, { useState, useEffect, useContext } from "react";
import { useMoralis } from "react-moralis";
import { config, sleep } from "../libs/util";

import { ABIS,  CHAIN_TOKEN_SYMBOL,CHAIN_TX_VIEWER } from "../libs/util";
import { ChainMetaContext } from "../libs/contexts";
import { useUser } from "../store/UserContext";






const ClaimModal = ({ isOpen, onClose, title, tag1, value1, tag2, value2, n }) => {


  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();

  const {
    web3: web3Provider,
    Moralis: { web3Library: ethers },
  } = useMoralis();
  
  const { user } = useMoralis();

  const [txConfirmationClaim, setTxConfirmationClaim] = useState(0);
  const [txHashClaim, setTxHashClaim] = useState(null);
  const [txErrorClaim, setTxErrorClaim] = useState(null);
  const [claimWorking, setClaimWorking] = useState(false);
  const { user: _user,setUser } = useUser();

  

  useEffect(() => {
    if (txErrorClaim) {
      setClaimWorking(false);
    } else {
      if (
        txHashClaim &&
        txConfirmationClaim === config.txConfirmationsNeededLrg
      ) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(
            chainMeta.networkId
          )}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetClaimState();
       
      }
    }
  }, [txConfirmationClaim, txHashClaim, txErrorClaim]);

  const web3_claims = async (ntype) => {
    setClaimWorking(true);

    const web3Signer = web3Provider.getSigner();
    const walletAddress = user.get("ethAddress");

    const tokenContract = new ethers.Contract(
      chainMeta.contracts.claim,
      ABIS.claims,
      web3Signer
    );

    try {

      const txResponse = await tokenContract.claimDeposit(ntype)

      // show a nice loading animation to user
      setTxHashClaim(txResponse.hash);

      await sleep(2);
      setTxConfirmationClaim(0.5);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      setTxConfirmationClaim(1);
      await sleep(2);

      if (txReceipt.status) {
        setTxConfirmationClaim(2);
      } else {
        const txErr = new Error("Token Contract Error on method faucet");
        console.error(txErr)
        setTxErrorClaim(txErr);
      }
    } catch (e) {
      setTxErrorClaim(e);
    }
  };
  
  const [clicked, setClicked] = useState(false)

  function resetClaimState() {
    setClaimWorking(false);
    setTxConfirmationClaim(0);
    setTxHashClaim(null);
    setTxErrorClaim(null);
    setClicked(false);
    onClose();
    setUser({
      ..._user,
      claimBalanceValues: ["a", "a", "a"],
    });
    claimBalance()
    
  }
  const claimBalance = async () => {

    const walletAddress = user.get("ethAddress");
    console.log("🚀 ~ file: App.js ~ line 192 ~ claimBalance ~ user", user)

    const contract = new ethers.Contract(
      "0x985A5c96663C9c44d46Ea061f4b7E50118180F8d",
      ABIS.claims,
      web3Provider
      );
      
    const claimUints = {
      rewards: 1,
      airdrops: 2,
      allocations: 3
    }


    let keys = Object.keys(claimUints);
    let values = keys.map((el) => {
      return claimUints[el]
    })
    
    let something =  values.map(async (el) => {

      let a = await contract.deposits(walletAddress,el)
      return a

    })

    let claimBalance = (await Promise.all(something)).map((el) => {
     const dates =new  Date( 
      (parseInt((el.lastDeposited._hex.toString()),16))*1000).toLocaleDateString("en-US")
      let value = parseInt(el.amount._hex.toString(),16)
      return { values : value , dates: dates}

    })

    const valuess = claimBalance.map((el) => {
      return el["values"]
    })
    const dates = claimBalance.map((el) => {
      return el["dates"]
    })
   
    await setUser({
      ..._user,
      claimBalanceValues: valuess,
      claimBalanceDates: dates
    })

  
  };




  const handleClick = () => {

   web3_claims(n)
   setClicked(!clicked)
  
  
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
        <ModalOverlay />
        {!clicked && 
        
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={10}>
            <Spacer/>
              
              <HStack spacing={100}>
                <Text fontSize="2xl" textAlign={"center"} >{tag1}</Text>
                <Text fontSize="2xl" textAlign={"center"}>{value1}</Text>
              </HStack>
              <HStack spacing={100}>
                <Text fontSize="2xl" textAlign={"center"}>{tag2}</Text>
                <Text fontSize="2xl" textAlign={"center"} >{value2}</Text>
              </HStack>
              <Spacer/>
            </VStack>
          </ModalBody>

          <Spacer/>

          <ModalFooter>
            <HStack spacing={10}>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="outline" onClick={handleClick}>Claim Now</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
        }
        {clicked && 
        <ModalContent>
          <ModalBody>
          <Spacer/>
          <Spacer/>

          {txHashClaim && (
              <Stack>
                <Progress
                  colorScheme="teal"
                  size="sm"
                  value={
                    (100 / config.txConfirmationsNeededLrg) *
                    txConfirmationClaim
                  }
                />

                <HStack>
                  <Text fontSize="sm">Transaction </Text>
                  <ShortAddress address={txHashClaim} />
                  <Link
                    href={`${
                      CHAIN_TX_VIEWER[chainMeta.networkId]
                    }${txHashClaim}`}
                    isExternal
                  >
                    {" "}
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
              </Stack>
            )}

            {txErrorClaim && (
              <Alert status="error">
                <AlertIcon />
                {txErrorClaim.message && (
                  <AlertTitle>{txErrorClaim.message}</AlertTitle>
                )}
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={resetClaimState}
                />
              </Alert>
            )}
            <Spacer/>
            <Spacer/>

          </ModalBody>



        </ModalContent>
        
        
        
        }


      </Modal>
    </>
  );
};

export default ClaimModal;

