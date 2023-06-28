import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Stack,
  Link,
  Progress,
  Box,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  HStack,
  Flex,
  Button,
  Checkbox,
  Divider,
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { sleep, MENU, itheumTokenRoundUtilExtended } from "libs/util";
import { DataNftMetadataType, OfferType } from "MultiversX/typesEVM";
import { useChainMeta } from "store/ChainMetaContext";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

export type ProcureAccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buyerFee: number;
  nftData: DataNftMetadataType;
  offer: OfferType;
  itheumPrice: number;
  marketContract: any;
  amount: number;
  setSessionId?: (e: any) => void;
  item: any;
  setMenuItem: any;
  onRefreshTokenBalance: any;
};

export default function ProcureDataNFTModalEVM(props: ProcureAccessModalProps) {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const [readTermsChecked, setReadTermsChecked] = useState(false);

  const [txAllowanceConfirmation, setTxAllowanceConfirmation] = useState(0);
  const [txAllowanceHash, setTxAllowanceHash] = useState<any>("");
  const [errAllowanceStreamGeneric, setErrAllowanceStreamGeneric] = useState<any>();

  const [txNFTConfirmation, setTxNFTConfirmation] = useState(0);
  const [txNFTHash, setTxNFTHash] = useState<any>("");
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>();

  const [purchaseSuccessful, setPurchaseSuccessful] = useState(false);
  const [totalPriceForAllowance, setTotalPriceForAllowance] = useState<number>(-1);

  const [procureInProgress, setProcureInProgress] = useState(false);

  // set ReadTermChecked checkbox as false when modal opened
  useEffect(() => {
    if (props.isOpen) {
      setReadTermsChecked(false);
    }
  }, [props.isOpen]);

  useEffect(() => {
    const priceInInt: number = parseInt(props.nftData.feeInTokens.toString(), 10);
    const _totalPriceForAllowance: number = priceInInt + (priceInInt / 100) * 2;

    setTotalPriceForAllowance(_totalPriceForAllowance);
  }, [props]);

  const web3_approve = async () => {
    try {
      setProcureInProgress(true);

      debugger; //eslint-disable-line
      const web3Signer = _chainMeta.ethersProvider.getSigner();
      const erc20 = new ethers.Contract(_chainMeta.contracts.itheumToken, ABIS.token, web3Signer);
      const allowance = await erc20.allowance(_chainMeta.loggedInAddress, _chainMeta.contracts.ddex);
      // const decimals = await erc20.decimals();

      const decimals = 18;
      const formattedVal = itheumTokenRoundUtilExtended(totalPriceForAllowance, 18, ethers.BigNumber, true); // makes it like 10.2 or 10.0
      const tokenInPrecision = ethers.utils.parseUnits(formattedVal.toString(), decimals).toHexString();

      const approveTx = await erc20.increaseAllowance(_chainMeta.contracts.ddex, tokenInPrecision);

      // show a nice loading animation to user
      setTxAllowanceHash(`https://shibuya.subscan.io/tx/${approveTx.hash}`);

      await sleep(2);

      setTxAllowanceConfirmation(40);

      // wait for 1 confirmation from ethers
      const txReceipt = await approveTx.wait();

      setTxAllowanceConfirmation(80);

      await sleep(2);

      if (txReceipt.status) {
        setTxAllowanceConfirmation(100);

        await sleep(2);
        web3_procure();
      }
    } catch (e) {
      console.error(e);
      setErrAllowanceStreamGeneric(e);
    }
  };

  const web3_procure = async () => {
    try {
      setErrAllowanceStreamGeneric(null);
      setTxAllowanceHash("");
      setTxAllowanceConfirmation(0);

      const web3Signer = _chainMeta.ethersProvider.getSigner();
      const ddexContract = new ethers.Contract(_chainMeta.contracts.ddex, ABIS.ddex, web3Signer);

      const _from = props.item.owner;
      const _to = _chainMeta.loggedInAddress;
      const _tokenId = parseInt(props.item.index, 10);

      const txResponse = await ddexContract.buyDataNFT(_from, _to, _tokenId, 0);

      // show a nice loading animation to user
      setTxNFTHash(`https://shibuya.subscan.io/tx/${txResponse.hash}`);

      await sleep(2);

      setTxNFTConfirmation(40);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();

      setTxNFTConfirmation(80);

      await sleep(2);

      if (txReceipt.status) {
        setTxNFTConfirmation(100);

        setProcureInProgress(false);
        setPurchaseSuccessful(true);

        props.onRefreshTokenBalance();
      } else {
        const txErr = new Error("NFT Contract Error on method buyDataNFT");
        console.error(txErr);
        setErrDataNFTStreamGeneric(txErr);
      }
    } catch (e) {
      console.error(e);
      setErrDataNFTStreamGeneric(e);
    }
  };

  function cleanupAndClose() {
    setErrAllowanceStreamGeneric(null);
    setTxAllowanceHash("");
    setTxAllowanceConfirmation(0);

    setErrDataNFTStreamGeneric(null);
    setTxNFTHash("");
    setTxNFTConfirmation(0);

    props.onClose();
  }

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={cleanupAndClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalBody py={6}>
            <HStack spacing="5" alignItems="center">
              <Box flex="4" alignContent="center">
                <Text fontSize="lg">Procure Access to Data NFTs</Text>
                <Flex mt="1">
                  <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                    {props.nftData.title}
                  </Text>
                </Flex>
              </Box>
              <Box flex="1">
                <Image src={props.nftData.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
              </Box>
            </HStack>

            <Box>
              <Flex fontSize="md" mt="2">
                <Box w="140px">How many</Box>
                <Box>: {props.amount ? props.amount : 1}</Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Unlock Fee (per NFT)</Box>
                <Box>: {itheumTokenRoundUtilExtended(props.nftData.feeInTokens, 18, ethers.BigNumber, true)} ITHEUM</Box>
              </Flex>
              <Flex>
                {new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).comparedTo(wantedTokenBalance) > 0 && (
                  <Text ml="146" color="red.400" fontSize="xs" mt="1 !important">
                    Your wallet token balance is too low to proceed
                  </Text>
                )}
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Buyer Tax (per NFT)</Box>
                <Box>: 2%</Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Total Fee</Box>
                {totalPriceForAllowance !== -1 && (
                  <Box>
                    {": "} {`${itheumTokenRoundUtilExtended(totalPriceForAllowance, 18, ethers.BigNumber, true)}`} ITHEUM
                  </Box>
                )}
              </Flex>
            </Box>

            <Box>
              <Flex mt="4 !important">
                <Button colorScheme="teal" variant="outline" size="sm" onClick={() => window.open("https://itheum.com/legal/datadex/termsofuse")}>
                  Read Terms of Use
                </Button>
              </Flex>
              <Checkbox size="sm" mt="3 !important" isChecked={readTermsChecked} onChange={(e: any) => setReadTermsChecked(e.target.checked)}>
                I have read all terms and agree to them
              </Checkbox>
            </Box>

            <Box mt="10px">
              <Divider mb="10px" />

              {txNFTHash && (
                <Link fontSize="sm" href={txNFTHash} isExternal>
                  Procure On-Chain TX <ExternalLinkIcon mx="2px" />
                </Link>
              )}

              {txAllowanceHash && (
                <Link fontSize="sm" href={txAllowanceHash} isExternal>
                  Allowance On-Chain TX <ExternalLinkIcon mx="2px" />
                </Link>
              )}

              {txNFTConfirmation > 0 && (
                <Box mt="10px">
                  <Text fontSize="sm">Procuring Data NFT...</Text>
                  <Progress colorScheme="teal" hasStripe value={txNFTConfirmation} />
                </Box>
              )}

              {txAllowanceConfirmation > 0 && (
                <Box mt="10px">
                  <Text fontSize="sm">Approving spending allowance for purchase...</Text>
                  <Progress colorScheme="teal" hasStripe value={txAllowanceConfirmation} />
                </Box>
              )}

              {errDataNFTStreamGeneric && (
                <Alert mt="10px" status="error">
                  <Stack>
                    <AlertTitle fontSize="md">
                      <AlertIcon mb={2} />
                      Process Error
                    </AlertTitle>
                    {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
                  </Stack>
                </Alert>
              )}

              {errAllowanceStreamGeneric && (
                <Alert mt="10px" status="error">
                  <Stack>
                    <AlertTitle fontSize="md">
                      <AlertIcon mb={2} />
                      Process Error
                    </AlertTitle>
                    {errAllowanceStreamGeneric.message && <AlertDescription fontSize="md">{errAllowanceStreamGeneric.message}</AlertDescription>}
                  </Stack>
                </Alert>
              )}
            </Box>

            {!purchaseSuccessful && (
              <Flex justifyContent="end" mt="4 !important">
                <Button colorScheme="teal" size="sm" mx="3" onClick={web3_approve} isDisabled={!readTermsChecked || procureInProgress}>
                  Proceed
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={cleanupAndClose} isDisabled={procureInProgress}>
                  Cancel
                </Button>
              </Flex>
            )}

            {purchaseSuccessful && (
              <Box textAlign="center" mt="6">
                <Alert status="success">
                  <Text colorScheme="teal">Success! You have procured this Data NFT.</Text>
                </Alert>
                <HStack mt="4">
                  <Button
                    colorScheme="teal"
                    onClick={() => {
                      props.setMenuItem(MENU.NFTMINE);
                      navigate("/datanfts/wallet");
                    }}>
                    Visit your Data NFT Wallet to see it!
                  </Button>
                  <Button colorScheme="teal" variant="outline" onClick={() => cleanupAndClose()}>
                    Close & Return
                  </Button>
                </HStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
