import React, { FC, useEffect, useState } from "react";
import { CheckCircleIcon, ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { signMessage } from "@multiversx/sdk-dapp/utils/account";
import moment from "moment/moment";
import { useLocalStorage } from "libs/hooks";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, isValidNumericCharacter, sleep, uxConfig } from "libs/util";
import { ItemType, RecordStringNumberType, UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { DataNftMintContract } from "../MultiversX/dataNftMint";
import { tokenDecimals } from "../MultiversX/tokenUtils";
import { ShortAddress } from "../UtilComps/ShortAddress";
import imgGuidePopup from "../img/guide-unblock-popups.png";

type DataNftWalletLowerCardProps = {
  dataNftItem: ItemType;
  index: number;
};

export const DataNftWalletLowerCard: FC<DataNftWalletLowerCardProps> = (props) => {
  const { dataNftItem, index } = props;

  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const itheumToken = _chainMeta.contracts.itheumToken;

  const [amounts, setAmounts] = useState<number>(1);
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number>(10);
  const [priceErrors, setPriceErrors] = useState<string[]>([]);
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const { isOpen: isAccessProgressModalOpen, onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();

  const { hasPendingTransactions } = useGetPendingTransactions();

  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2

  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const [selectedDataNft, setSelectedDataNft] = useState<ItemType | undefined>();

  const [unlockAccessProgress, setUnlockAccessProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
  });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState<string>("");

  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const _marketRequirements = await marketContract.getRequirements();
      const _maxPaymentFeeMap: RecordStringNumberType = {};

      if (_marketRequirements) {
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
      }

      setMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();
  }, []);

  const onChangeDataNftBurnAmount = (valueAsString: string) => {
    let error = "";
    const valueAsNumber = Number(valueAsString);
    console.log("valueAsNumber", valueAsNumber);
    console.log("selectedDataNft", selectedDataNft);
    if (valueAsNumber < 1) {
      error = "Burn Amount cannot be zero or negative";
    } else if (selectedDataNft && valueAsNumber > Number(selectedDataNft.balance)) {
      error = "Data NFT balance exceeded";
    }
    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(valueAsNumber);
  };

  const onBurnButtonClick = (nft: ItemType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance)); // init
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  const onListButtonClick = (nft: ItemType) => {
    setSelectedDataNft(nft);
    onListNFTOpen();
  };

  useEffect(() => {
    (async () => {
      if (address && !hasPendingTransactions) {
        const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
        console.log("User data", _userData);
        setUserData(_userData);
      }
    })();
  }, [address, hasPendingTransactions]);

  const fetchAccountSignature = async (message: string) => {
    const signResult = {
      signature: "",
      addrInHex: "",
      success: false,
      exception: "",
    };

    let customError = "Signature result not received from wallet";

    if (walletUsedSession === "el_webwallet") {
      // web wallet not supported
      customError = "Currently, Signature verifications do not work on Web Wallet. Please use the XPortal App or the DeFi Wallet Browser Plugin.";
    } else {
      try {
        const signatureObj = await signMessage({ message });
        console.log("signatureObj");
        console.log(signatureObj);

        if (signatureObj?.signature && signatureObj?.address) {
          // Maiar App V2 / Ledger
          signResult.signature = signatureObj.signature.hex();
          signResult.addrInHex = signatureObj.address.hex();
          signResult.success = true;
        } else {
          signResult.exception = "Signature result from wallet was malformed";
        }
      } catch (e: any) {
        signResult.success = false;
        signResult.exception = e.toString();
      }

      console.log("signResult");
      console.log(signResult);
    }

    if (signResult.signature === null || signResult.signature === "" || signResult.addrInHex === null || signResult.addrInHex === "") {
      signResult.success = false;
      signResult.exception = customError;
    }

    return signResult;
  };

  const cleanupAccessDataStreamProcess = () => {
    setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0 });
    setErrUnlockAccessGeneric("");
    onAccessProgressModalClose();
  };

  const accessDataStream = async (NFTid: string, myAddress: string) => {
    /*
          1) get a nonce from the data marshal (s1)
          2) get user to sign the nonce and obtain signature (s2)
          3) send the signature for verification from the marshal and open stream in new window (s3)
        */

    onAccessProgressModalOpen();

    try {
      // const chainId = _chainMeta.networkId;
      const res = await fetch(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/preaccess?chainId=${_chainMeta.networkId}`);
      const data = await res.json();

      if (data && data.nonce) {
        setUnlockAccessProgress((prevProgress) => ({ ...prevProgress, s1: 1 }));

        await sleep(3);

        const signResult = await fetchAccountSignature(data.nonce);

        if (signResult.success === false) {
          setErrUnlockAccessGeneric(signResult.exception);
        } else {
          setUnlockAccessProgress((prevProgress) => ({
            ...prevProgress,
            s2: 1,
          }));
          await sleep(3);

          // auto download the file without ever exposing the url
          const link = document.createElement("a");
          link.target = "_blank";
          link.setAttribute("target", "_blank");
          link.href = `${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/access?nonce=${data.nonce}&NFTid=${NFTid}&signature=${signResult.signature}&chainId=${_chainMeta.networkId}&accessRequesterAddr=${signResult.addrInHex}`;
          link.dispatchEvent(new MouseEvent("click"));

          await sleep(3);

          cleanupAccessDataStreamProcess();
        }
      } else {
        if (data.success === false) {
          setErrUnlockAccessGeneric(`${data.error.code}, ${data.error.message}`);
        } else {
          setErrUnlockAccessGeneric("Data Marshal responded with an unknown error trying to generate your access links");
        }
      }
    } catch (e: any) {
      setErrUnlockAccessGeneric(e.toString());
    }
  };

  const onBurn = () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!selectedDataNft) {
      toast({
        title: "No NFT is selected",
        status: "error",
        isClosable: true,
      });
      return;
    }

    mintContract.sendBurnTransaction(address, dataNftItem.collection, dataNftItem.nonce, dataNftBurnAmount);

    // close modal
    onBurnNFTClose();
  };

  const onList = () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!selectedDataNft) {
      toast({
        title: "No NFT is selected",
        status: "error",
        isClosable: true,
      });
      return;
    }
    marketContract.addToMarket(dataNftItem.collection, dataNftItem.nonce, amounts, prices ?? 0, address);

    //
    onListNFTClose();
  };

  return (
    <>
      <Flex h="28rem" flexDirection="column" justify="space-between">
        <Box>
          {
            <Box color="gray.600" fontSize="sm">
              Creator: <ShortAddress address={new Address(dataNftItem.creator)}></ShortAddress>
              <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${new Address(dataNftItem.creator)}`} isExternal>
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Box>
          }

          <Box color="gray.600" fontSize="sm">
            {`Creation time: ${moment(dataNftItem.creationTime).format(uxConfig.dateStr)}`}
          </Box>

          <Badge borderRadius="full" px="2" colorScheme="teal">
            <Text>You are the {dataNftItem.creator !== address ? "Owner" : "Creator"}</Text>
          </Badge>

          <Badge borderRadius="full" px="2" colorScheme="blue">
            Fully Transferable License
          </Badge>

          <Button mt="2" size="sm" colorScheme="red" height="5" isDisabled={hasPendingTransactions} onClick={(e) => onBurnButtonClick(dataNftItem)}>
            Burn
          </Button>

          <Box color="gray.600" fontSize="sm" my={2}>
            {`Balance: ${dataNftItem.balance}`} <br />
            {`Total supply: ${dataNftItem.supply}`} <br />
            {`Royalty: ${dataNftItem.royalties * 100}%`}
          </Box>

          <HStack mt="2">
            <Button
              size="sm"
              colorScheme="teal"
              height="7"
              onClick={() => {
                accessDataStream(dataNftItem.id, address);
              }}>
              View Data
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              height="7"
              variant="outline"
              onClick={() => {
                window.open(dataNftItem.dataPreview);
              }}>
              Preview Data
            </Button>
          </HStack>

          <HStack mt="5">
            <Text fontSize="xs" w="110px">
              How many to list:{" "}
            </Text>
            <NumberInput
              size="xs"
              maxW={16}
              step={1}
              defaultValue={1}
              min={1}
              max={dataNftItem.balance}
              isValidCharacter={isValidNumericCharacter}
              value={amounts}
              onChange={(value) => {
                let error = "";
                const valueAsNumber = Number(value);
                if (valueAsNumber <= 0) {
                  error = "Cannot be zero or negative";
                } else if (valueAsNumber > dataNftItem.balance) {
                  error = "Cannot exceed balance";
                }
                setAmountErrors((oldErrors) => {
                  const newErrors = [...oldErrors];
                  newErrors[index] = error;
                  return newErrors;
                });
                setAmounts(valueAsNumber);
              }}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          {amountErrors[index] && (
            <Text color="red.400" fontSize="xs">
              {amountErrors[index]}
            </Text>
          )}

          <HStack mt="2">
            <Text fontSize="xs" w="110px">
              Listing price for each:{" "}
            </Text>
            <NumberInput
              size="xs"
              maxW={16}
              step={5}
              defaultValue={10}
              min={0}
              isValidCharacter={isValidNumericCharacter}
              max={maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0} // need to update hardcoded tokenId
              value={prices}
              onChange={(valueString, valueAsNumber) => {
                let error = "";
                if (valueAsNumber < 0) error = "Cannot be negative";
                if (valueAsNumber > maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0) error = "Cannot exceed maximum listing price";
                setPriceErrors((oldErrors) => {
                  const newErrors = [...oldErrors];
                  newErrors[index] = error;
                  return newErrors;
                });
                setPrices(!valueAsNumber ? 0 : valueAsNumber);
              }}
              keepWithinRange={true}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          {priceErrors[index] && (
            <Text color="red.400" fontSize="xs">
              {priceErrors[index]}
            </Text>
          )}

          <Button
            size="xs"
            mt={3}
            colorScheme="teal"
            variant="outline"
            isDisabled={hasPendingTransactions || !!amountErrors[index] || !!priceErrors[index]}
            onClick={() => onListButtonClick(dataNftItem)}>
            List {amounts} NFT{amounts > 1 && "s"} for {prices ? `${prices} ITHEUM ${amounts > 1 ? "each" : ""}` : "Free"}
          </Button>

          <Box
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            height="100%"
            width="100%"
            backgroundColor="blackAlpha.800"
            rounded="lg"
            visibility={
              userData && (userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(dataNftItem.nonce))) ? "visible" : "collapse"
            }
            backdropFilter="auto"
            backdropBlur="6px">
            <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2">
              - FROZEN - <br />
              Data NFT is under investigation by the DAO as there was a complaint received against it
            </Text>
          </Box>
        </Box>

        {selectedDataNft && (
          <Modal isOpen={isBurnNFTOpen} onClose={onBurnNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
            <ModalContent>
              {burnNFTModalState === 1 ? (
                <>
                  <ModalHeader>Burn Supply from my Data NFT</ModalHeader>
                  <ModalBody pb={6}>
                    <HStack spacing="5" alignItems="center">
                      <Box flex="1.1">
                        <Stack>
                          <Image src={selectedDataNft.nftImgUrl} h={100} w={100} borderRadius="md" m="auto" />
                          <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                            {selectedDataNft.tokenName}
                          </Text>
                        </Stack>
                      </Box>
                      <Box flex="1.9" alignContent="center">
                        <Text color="orange.300" fontSize="sm">
                          You have ownership of {selectedDataNft.balance} Data NFTs (out of a total of {selectedDataNft.supply}). You can burn these{" "}
                          {selectedDataNft.balance} Data NFTs and remove them from your wallet.
                          {selectedDataNft.supply - selectedDataNft.balance > 0 &&
                            ` The remaining ${selectedDataNft.supply - selectedDataNft.balance} are not under your ownership.`}
                        </Text>
                      </Box>
                    </HStack>

                    <Text fontSize="md" mt="4">
                      Please note that Data NFTs not listed in the Data NFT marketplace are &quot;NOT public&quot; and are &quot;Private&quot; to only you so on
                      one can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not
                      be able to recover them again.
                    </Text>

                    <HStack mt="8">
                      <Text fontSize="md">How many do you want to burn?</Text>
                      <NumberInput
                        size="xs"
                        maxW={16}
                        step={1}
                        defaultValue={selectedDataNft.balance}
                        min={1}
                        max={selectedDataNft.balance}
                        isValidCharacter={isValidNumericCharacter}
                        value={dataNftBurnAmount}
                        onChange={onChangeDataNftBurnAmount}
                        keepWithinRange={true}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                    {dataNftBurnAmountError && (
                      <Text ml="208px" color="red.400" fontSize="sm" mt="1 !important">
                        {dataNftBurnAmountError}
                      </Text>
                    )}

                    <Flex justifyContent="end" mt="8 !important">
                      <Button
                        colorScheme="teal"
                        size="sm"
                        mx="3"
                        onClick={() => setBurnNFTModalState(2)}
                        isDisabled={!!dataNftBurnAmountError || hasPendingTransactions}>
                        I want to Burn my {dataNftBurnAmount} Data NFTs
                      </Button>
                      <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
                        Cancel
                      </Button>
                    </Flex>
                  </ModalBody>
                </>
              ) : (
                <>
                  <ModalHeader>Are you sure?</ModalHeader>
                  <ModalBody pb={6}>
                    <Flex>
                      <Text fontWeight="bold" fontSize="md" px="1">
                        Data NFT Title: &nbsp;
                      </Text>
                      <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1">
                        {selectedDataNft.title}
                      </Text>
                    </Flex>
                    <Flex mt="1">
                      <Text fontWeight="bold" fontSize="md" px="1">
                        Burn Amount: &nbsp;&nbsp;
                      </Text>
                      <Text fontSize="sm" backgroundColor="blackAlpha.300" px="1">
                        {dataNftBurnAmount}
                      </Text>
                    </Flex>
                    <Text fontSize="md" mt="2">
                      Are you sure you want to proceed with burning the Data NFTs? You cannot undo this action.
                    </Text>
                    <Flex justifyContent="end" mt="6 !important">
                      <Button colorScheme="teal" size="sm" mx="3" onClick={onBurn} isDisabled={hasPendingTransactions}>
                        Proceed
                      </Button>
                      <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
                        Cancel
                      </Button>
                    </Flex>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        )}

        {selectedDataNft && (
          <Modal isOpen={isListNFTOpen} onClose={onListNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
            <ModalContent>
              <ModalBody py={6}>
                <HStack spacing="5" alignItems="center">
                  <Box flex="4" alignContent="center">
                    <Text fontSize="lg">List my Data NFT on the Public Marketplace</Text>
                    <Flex mt="1">
                      <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                        {selectedDataNft.tokenName}
                      </Text>
                    </Flex>
                  </Box>
                  <Box flex="1">
                    <Image src={selectedDataNft.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                  </Box>
                </HStack>

                <Text fontSize="md" mt="4">
                  How many to list: {amounts}
                </Text>
                <Text fontSize="md" mt="2">
                  Listing fee per NFT: {prices ? `${prices} ITHEUM` : "FREE"}{" "}
                </Text>

                <Text display="none" fontSize="md" mt="8">
                  Advanced:
                </Text>
                <Flex display="none" mt="2" justifyContent="flex-start" alignItems="center" gap="4">
                  <Text fontSize="md">Access Time Limit per SFT: </Text>
                  <Select size="sm" width="120px" defaultValue="unlimited">
                    <option value="unlimited">Unlimited</option>
                  </Select>
                </Flex>

                <Flex justifyContent="end" mt="8 !important">
                  <Button colorScheme="teal" size="sm" mx="3" onClick={onList} isDisabled={hasPendingTransactions}>
                    Proceed
                  </Button>
                  <Button colorScheme="teal" size="sm" variant="outline" onClick={onListNFTClose}>
                    Cancel
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        <Modal isOpen={isAccessProgressModalOpen} onClose={cleanupAccessDataStreamProcess} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Data Access Unlock Progress</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing={5}>
                <HStack>
                  {(!unlockAccessProgress.s1 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                  <Text>Initiating handshake with Data Marshal</Text>
                </HStack>

                <HStack>
                  {(!unlockAccessProgress.s2 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                  <Stack>
                    <Text>Please sign transaction to complete handshake</Text>
                    <Text fontSize="sm">Note: This will not use gas or submit any blockchain transactions</Text>
                  </Stack>
                </HStack>

                <HStack>
                  {(!unlockAccessProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                  <Text>Verifying data access rights to unlock Data Stream</Text>
                </HStack>

                {unlockAccessProgress.s1 && unlockAccessProgress.s2 && !unlockAccessProgress.s3 && (
                  <Stack border="solid .04rem" padding={3} borderRadius={5}>
                    <Text fontSize="sm" lineHeight={1.7}>
                      <InfoIcon boxSize={5} mr={1} />
                      Popups are needed for the Data Marshal to give you access to Data Streams. If your browser is prompting you to allow popups, please select{" "}
                      <b>Always allow pop-ups</b>
                    </Text>
                    <Image boxSize="250px" height="auto" m=".5rem auto 0 auto !important" src={imgGuidePopup} borderRadius={10} />
                  </Stack>
                )}

                {errUnlockAccessGeneric && (
                  <Alert status="error">
                    <Stack>
                      <AlertTitle fontSize="md">
                        <AlertIcon mb={2} />
                        Process Error
                      </AlertTitle>
                      {errUnlockAccessGeneric && <AlertDescription fontSize="md">{errUnlockAccessGeneric}</AlertDescription>}
                      <CloseButton position="absolute" right="8px" top="8px" onClick={cleanupAccessDataStreamProcess} />
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </>
  );
};
