import React, { useEffect, useState } from "react";
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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetLoginInfo, useGetNetworkConfig, useGetPendingTransactions, useGetSignedTransactions } from "@multiversx/sdk-dapp/hooks";
import axios from "axios";
import { motion } from "framer-motion";
import moment from "moment";
import { MdOutlineInfo } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import imgGuidePopup from "assets/img/guide-unblock-popups.png";
import ExploreAppButton from "components/UtilComps/ExploreAppButton";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, PREVIEW_DATA_ON_DEVNET_SESSION_KEY, contractsForChain, uxConfig } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { labels } from "libs/language";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { DataNftType } from "libs/MultiversX/types";
import {
  backendApi,
  convertToLocalString,
  isValidNumericCharacter,
  nativeAuthOrigins,
  shouldPreviewDataBeEnabled,
  sleep,
  transformDescription,
} from "libs/utils";
import { useMarketStore, useMintStore } from "store";
import ListDataNFTModal from "./ListDataNFTModal";

export type WalletDataNFTMxPropType = {
  hasLoaded: boolean;
  maxPayment: number;
  setHasLoaded: (hasLoaded: boolean) => void;
  sellerFee: number;
  openNftDetailsDrawer: (e: number) => void;
  isProfile?: boolean;
} & DataNftType;

export default function WalletDataNFTMX(item: WalletDataNFTMxPropType) {
  const { chainID, network } = useGetNetworkConfig();
  const { loginMethod, tokenLogin } = useGetLoginInfo();
  const { colorMode } = useColorMode();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const toast = useToast();
  const navigate = useNavigate();
  const isWebWallet = loginMethod == "wallet";
  const userData = useMintStore((state) => state.userData);
  const isMarketPaused = useMarketStore((state) => state.isMarketPaused);
  const marketRequirements = useMarketStore((state) => state.marketRequirements);

  const { isOpen: isAccessProgressModalOpen, onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();
  const [unlockAccessProgress, setUnlockAccessProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
  });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState<string>("");
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2
  const mintContract = new DataNftMintContract(chainID);
  const marketContract = new DataNftMarketContract(chainID);
  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const [selectedDataNft, setSelectedDataNft] = useState<DataNftType | undefined>();
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const [amount, setAmount] = useState(1);
  const [amountError, setAmountError] = useState("");
  const [price, setPrice] = useState(10);
  const [priceError, setPriceError] = useState("");
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const [webWalletListTxHash, setWebWalletListTxHash] = useState("");
  const maxListLimit = process.env.REACT_APP_MAX_LIST_LIMIT_PER_SFT ? Number(process.env.REACT_APP_MAX_LIST_LIMIT_PER_SFT) : 0;
  const maxListNumber = maxListLimit > 0 ? Math.min(maxListLimit, item.balance) : item.balance;
  const backendUrl = backendApi(chainID);
  const { signedTransactionsArray, hasSignedTransactions } = useGetSignedTransactions();

  useEffect(() => {
    if (!isWebWallet) return;
    if (!hasSignedTransactions) return;

    const [, sessionInfo] = signedTransactionsArray[0];
    try {
      const txHash = sessionInfo.transactions[0].hash;

      if (webWalletListTxHash == "") {
        setWebWalletListTxHash(txHash);
      }
    } catch (e) {
      sessionStorage.removeItem("web-wallet-tx");
    }
  }, [hasSignedTransactions]);

  useEffect(() => {
    if (!isWebWallet) return;
    if (!webWalletListTxHash) return;
    const data = sessionStorage.getItem("web-wallet-tx");

    if (!data) return;

    const txData = JSON.parse(data);

    if (txData) {
      if (txData.type === "add-offer-tx") {
        addOfferBackend(
          webWalletListTxHash,
          txData.offered_token_identifier,
          txData.offered_token_nonce,
          txData.offered_token_amount,
          txData.title,
          txData.description,
          txData.wanted_token_identifier,
          txData.wanted_token_nonce,
          txData.wanted_token_amount,
          txData.quantity,
          txData.owner
        );
      }
      sessionStorage.removeItem("web-wallet-tx");
    }
  }, [webWalletListTxHash]);

  async function addOfferBackend(
    txHash: string,
    offered_token_identifier: string,
    offered_token_nonce: string,
    offered_token_amount: string,
    title: string,
    description: string,
    wanted_token_identifier: string,
    wanted_token_nonce: string,
    wanted_token_amount: string,
    quantity: number,
    owner: string
  ) {
    try {
      let indexResponse;
      let success = false;

      // Use a loop with a boolean condition
      while (!success) {
        indexResponse = await axios.get(
          `https://${getApi(chainID)}/accounts/${contractsForChain(chainID).market}/transactions?hashes=${txHash}&withScResults=true&withLogs=true`
        );

        if (indexResponse.data[0].status === "success" && typeof indexResponse.data[0].pendingResults === "undefined") {
          success = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 4000));
      }

      if (indexResponse) {
        const results = indexResponse.data[0].results;
        const txLogs = indexResponse.data[0].logs.events;

        const allLogs = [];

        for (const result of results) {
          if (result.logs && result.logs.events) {
            const events = result.logs.events;
            allLogs.push(...events);
          }
        }

        allLogs.push(...txLogs);

        const addOfferEvent = allLogs.find((log: any) => log.identifier === "addOffer");

        const indexFound = addOfferEvent.topics[1];
        const index = parseInt(Buffer.from(indexFound, "base64").toString("hex"), 16);
        const headers = {
          Authorization: `Bearer ${tokenLogin?.nativeAuthToken}`,
          "Content-Type": "application/json",
        };

        const requestBody = {
          index: index,
          offered_token_identifier: offered_token_identifier,
          offered_token_nonce: offered_token_nonce,
          offered_token_amount: offered_token_amount,
          title: title,
          description: description,
          wanted_token_identifier: wanted_token_identifier,
          wanted_token_nonce: wanted_token_nonce,
          wanted_token_amount: wanted_token_amount,
          quantity: quantity,
          owner: owner,
        };

        const response = await fetch(`${backendUrl}/addOffer`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("Response:", data);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const showErrorToast = (title: string) => {
    toast({
      title,
      status: "error",
      isClosable: true,
    });
  };

  const onBurn = () => {
    const errorMessages = {
      noWalletConn: labels.ERR_BURN_NO_WALLET_CONN,
      noNFTSelected: labels.ERR_BURN_NO_NFT_SELECTED,
    };

    const conditions = [
      {
        condition: !address,
        errorMessage: errorMessages.noWalletConn,
      },
      {
        condition: !selectedDataNft,
        errorMessage: errorMessages.noNFTSelected,
      },
    ];

    const shouldReturn = conditions.some(({ condition, errorMessage }) => {
      if (condition) {
        showErrorToast(errorMessage);
        return true;
      }
      return false;
    });

    if (shouldReturn || !selectedDataNft) {
      return;
    }

    mintContract.sendBurnTransaction(
      address,
      selectedDataNft.collection,
      selectedDataNft.nonce,
      dataNftBurnAmount,
      contractsForChain(chainID).dataNftTokens.find((t) => t.id === selectedDataNft.collection)?.contract
    );

    onBurnNFTClose();
  };

  async function accessDataStream(_dataNonce: number) {
    try {
      onAccessProgressModalOpen();

      setUnlockAccessProgress((prevProgress) => ({
        ...prevProgress,
        s1: 1,
        s2: 1,
      }));
      await sleep(3);

      // auto download the file without ever exposing the url
      if (!(tokenLogin && tokenLogin.nativeAuthToken)) {
        throw Error(labels.NATIVE_AUTH_TOKEN_MISSING);
      }

      DataNft.setNetworkConfig(network.id);
      const dataNft = await DataNft.createFromApi({ nonce: _dataNonce });
      console.log(nativeAuthOrigins(), tokenLogin.nativeAuthToken, window.location.hostname);
      const arg = {
        mvxNativeAuthOrigins: nativeAuthOrigins(),
        mvxNativeAuthMaxExpirySeconds: 3600,
        fwdHeaderMapLookup: {
          "authorization": `Bearer ${tokenLogin.nativeAuthToken}`,
        },
      };
      const res = await dataNft.viewDataViaMVXNativeAuth(arg);

      if (!res.error) {
        const link = document.createElement("a");
        link.target = "_blank";
        link.download = `DataNFT-${_dataNonce}`;
        link.href = window.URL.createObjectURL(new Blob([res.data], { type: res.contentType }));
        link.click();
      } else {
        throw Error(res.error);
      }

      setUnlockAccessProgress((prevProgress) => ({
        ...prevProgress,
        s3: 1,
      }));
    } catch (e: any) {
      setErrUnlockAccessGeneric(e.toString());
    }
  }

  const cleanupAccessDataStreamProcess = () => {
    setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0 });
    setErrUnlockAccessGeneric("");
    onAccessProgressModalClose();
  };

  const onBurnButtonClick = (nft: DataNftType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance));
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  const onListButtonClick = (nft: DataNftType) => {
    if (isMarketPaused) {
      toast({
        title: "Marketplace is paused",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else {
      setSelectedDataNft(nft);
      onListNFTOpen();
    }
  };

  const onChangeDataNftBurnAmount = (valueAsString: string) => {
    let error = "";
    const valueAsNumber = Number(valueAsString);
    if (valueAsNumber < 1) {
      error = "Burn amount cannot be zero or negative";
    } else if (selectedDataNft && valueAsNumber > Number(selectedDataNft.balance)) {
      error = "Data NFT balance exceeded";
    }

    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(valueAsNumber);
  };

  const formatButtonNumber = (_price: number, _amount: number) => {
    if (_price > 0) {
      if (_price >= item.maxPayment) {
        return item.maxPayment.toString() + " ITHEUM " + (_amount > 1 ? "each" : "");
      } else {
        return _price.toString() + " ITHEUM " + (_amount > 1 ? "each" : "");
      }
    } else {
      return "Free";
    }
  };

  return (
    <Skeleton fitContent={true} isLoaded={item.hasLoaded} borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
      <Box
        w="275px"
        h={item.isProfile === true ? "660px" : "840px"}
        mx="3 !important"
        key={item.id}
        border="1px solid transparent"
        borderColor="#00C79740"
        borderRadius="16px"
        mb="1rem"
        position="relative">
        <Flex justifyContent="center">
          <Image
            src={item.nftImgUrl}
            alt={item.dataPreview}
            h={236}
            w={236}
            mx={6}
            mt={6}
            borderRadius="32px"
            onLoad={() => item.setHasLoaded(true)}
            onClick={() => item.openNftDetailsDrawer(item.index)}
          />
          <motion.button
            style={{
              position: "absolute",
              zIndex: "1",
              top: "0",
              bottom: "0",
              right: "0",
              left: "0",
              height: "236px",
              width: "236px",
              marginInlineStart: "1.2rem",
              marginInlineEnd: "1.2rem",
              marginTop: "1.5rem",
              borderRadius: "32px",
              cursor: "pointer",
              opacity: 0,
            }}
            onLoad={() => item.setHasLoaded(true)}
            onClick={() => item.openNftDetailsDrawer(item.index)}
            whileHover={{ opacity: 1, backdropFilter: "blur(1px)", backgroundColor: "#1b1b1ba0" }}>
            <Text as="div" border="1px solid" borderColor="teal.400" borderRadius="5px" variant="outline" w={20} h={8} textAlign="center" mx="20">
              <Text as="p" mt={1} fontWeight="400" textColor="white">
                Details
              </Text>
            </Text>
          </motion.button>
        </Flex>

        <Flex h="28rem" mx={6} my={3} direction="column" justify={item.isProfile === true ? "initial" : "space-between"}>
          <Text fontSize="md" color="#929497">
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/nfts/${item.id}`} isExternal>
              {item.tokenName} <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
          <Popover trigger="hover" placement="auto">
            <PopoverTrigger>
              <div>
                <Text fontWeight="semibold" fontSize="lg" mt="1.5" noOfLines={1}>
                  {item.title}
                </Text>

                <Flex flexGrow="1">
                  <Text fontSize="md" color="#929497" noOfLines={2} w="100%" h="10">
                    {transformDescription(item.description)}
                  </Text>
                </Flex>
              </div>
            </PopoverTrigger>
            <PopoverContent mx="2" width="220px" mt="-7">
              <PopoverHeader fontWeight="semibold" fontSize="lg">
                {item.title}
              </PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <Text fontSize="md" mt="1" color="#929497">
                  {transformDescription(item.description)}
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Box mt={1}>
            <Box color="#8c8f92d0" fontSize="md" display="flex" alignItems="center">
              Creator:&nbsp;
              <Flex alignItems="center" onClick={() => navigate(`/profile/${item.creator}`)}>
                <ShortAddress address={item.creator} fontSize="lg" tooltipLabel="Profile" />
                <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797" }} fontSize="lg" />
              </Flex>
            </Box>

            <Box color="#8c8f92d0" fontSize="md">
              {`Creation time: ${moment(item.creationTime).format(uxConfig.dateStr)}`}
            </Box>

            <Stack display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" my="2" height="7rem">
              <Badge borderRadius="md" px="3" py="1" mt="1" colorScheme="teal">
                <Text fontSize={"sm"} fontWeight="semibold">
                  You are the {item.creator !== address ? "Owner" : "Creator"}
                </Text>
              </Badge>

              <Badge borderRadius="md" px="3" py="1" bgColor="#E2AEEA30">
                <Text fontSize={"sm"} fontWeight="semibold" color={colorMode === "dark" ? "#E2AEEA" : "#af82b5"}>
                  Fully Transferable License
                </Text>
              </Badge>

              <HStack mt="1">
                <Button
                  size="sm"
                  w="full"
                  borderRadius="lg"
                  fontSize="sm"
                  bgColor="#FF439D"
                  _hover={{ backgroundColor: "#FF439D70" }}
                  isDisabled={hasPendingTransactions}
                  onClick={() => onBurnButtonClick(item)}>
                  Burn
                </Button>

                <ExploreAppButton nonce={item.nonce} />
              </HStack>
            </Stack>
            <Box color="#8c8f92d0" fontSize="md" fontWeight="normal" my={2}>
              {`Balance: ${item.balance}`} <br />
              {`Total supply: ${item.supply}`} <br />
              {`Royalty: ${convertToLocalString(item.royalties * 100)}%`}
            </Box>

            <HStack mt="2">
              <Tooltip
                colorScheme="teal"
                hasArrow
                label="View Data is disabled on devnet"
                isDisabled={shouldPreviewDataBeEnabled(chainID, previewDataOnDevnetSession)}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  w="full"
                  isDisabled={!shouldPreviewDataBeEnabled(chainID, previewDataOnDevnetSession)}
                  onClick={() => {
                    accessDataStream(item.nonce);
                  }}>
                  View Data
                </Button>
              </Tooltip>

              <Tooltip
                colorScheme="teal"
                hasArrow
                label="Preview Data is disabled on devnet"
                isDisabled={shouldPreviewDataBeEnabled(chainID, previewDataOnDevnetSession)}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  w="full"
                  variant="outline"
                  isDisabled={!shouldPreviewDataBeEnabled(chainID, previewDataOnDevnetSession)}
                  onClick={() => {
                    window.open(item.dataPreview);
                  }}>
                  <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
                    Preview Data
                  </Text>
                </Button>
              </Tooltip>
            </HStack>

            <Flex mt="7" display={item.isProfile === true ? "none" : "flex"} flexDirection="row" justifyContent="space-between" alignItems="center" maxH={10}>
              <Text fontSize="md" color="#929497">
                How many to list:{" "}
              </Text>
              <NumberInput
                size="sm"
                borderRadius="4.65px !important"
                maxW={20}
                step={1}
                defaultValue={1}
                min={1}
                max={maxListNumber}
                isValidCharacter={isValidNumericCharacter}
                value={amount}
                onChange={(value) => {
                  let error = "";
                  const valueAsNumber = Number(value);
                  if (valueAsNumber <= 0) {
                    error = "Cannot be zero or negative";
                  } else if (valueAsNumber > item.balance) {
                    error = "Not enough balance";
                  } else if (maxListLimit > 0 && valueAsNumber > maxListLimit) {
                    error = "Cannot exceed max list limit";
                  }

                  setAmountError(error);
                  setAmount(valueAsNumber);
                }}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>

            <Box h={3}>
              {amountError && (
                <Text color="red.400" fontSize="xs">
                  {amountError}
                </Text>
              )}
            </Box>

            <Flex mt="5" display={item.isProfile === true ? "none" : "flex"} flexDirection="row" justifyContent="space-between" alignItems="center" maxH={10}>
              <Tooltip label="This fee is what your dataset is advertised for on the marketplace">
                <Text fontSize="md" color="#929497">
                  Access fee for each:
                </Text>
              </Tooltip>
              <NumberInput
                size="sm"
                maxW={20}
                step={5}
                defaultValue={10}
                min={0}
                isValidCharacter={isValidNumericCharacter}
                max={item.maxPayment ? item.maxPayment : 0}
                value={price}
                onChange={(valueString) => {
                  let error = "";
                  const valueAsNumber = Number(valueString);
                  if (valueAsNumber < 0) {
                    error = "Cannot be negative";
                  } else if (valueAsNumber > item.maxPayment ? item.maxPayment : 0) {
                    error = "Maximum listing fee is" + " " + item.maxPayment;
                  }
                  setPriceError(error);
                  setPrice(valueAsNumber);
                }}
                keepWithinRange={false}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
            <Box h={3}>
              {priceError && (
                <Text color="red.400" fontSize="xs">
                  {priceError}
                </Text>
              )}
            </Box>

            <Tooltip colorScheme="teal" hasArrow placement="top" label="Market is paused" isDisabled={!isMarketPaused}>
              <Button
                size="sm"
                mt={4}
                width="215px"
                display={item.isProfile === true ? "none" : "flex"}
                colorScheme="teal"
                variant="outline"
                isDisabled={
                  hasPendingTransactions ||
                  !!amountError ||
                  !!priceError ||
                  isMarketPaused ||
                  marketRequirements.maximumPaymentFees[0] === undefined ||
                  marketRequirements.maximumPaymentFees[0] === null
                }
                onClick={() => onListButtonClick(item)}>
                <Text py={3} color={colorMode === "dark" ? "white" : "black"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  List {amount} NFT{amount > 1 && "s"} for {formatButtonNumber(price, amount)}
                </Text>
              </Button>
            </Tooltip>
          </Box>
        </Flex>

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
            userData && (userData?.addressFrozen || (userData?.frozenNonces && userData?.frozenNonces.includes(item?.nonce))) ? "visible" : "collapse"
          }
          backdropFilter="auto"
          backdropBlur="6px">
          <Box fontSize="24px" fontWeight="500" lineHeight="38px" position="absolute" top="45%" textAlign="center" textColor="teal.200" px="2">
            - FROZEN -{" "}
            <Text fontSize="16px" fontWeight="400" textColor="white" lineHeight="25px" px={3}>
              Data NFT is under investigation by the DAO as there was a complaint received against it
            </Text>
          </Box>
        </Box>
        {selectedDataNft && (
          <Modal isOpen={isBurnNFTOpen} onClose={onBurnNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
              {burnNFTModalState === 1 ? (
                <>
                  <ModalHeader>Burn Supply from my Data NFT</ModalHeader>
                  <ModalBody pb={6}>
                    <HStack spacing="5" alignItems="center">
                      <Box flex="1.1">
                        <Stack>
                          <Image src={selectedDataNft.nftImgUrl} h={100} w={100} borderRadius="md" m="auto" />
                          <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" textAlign="center">
                            {selectedDataNft.tokenName}
                          </Text>
                        </Stack>
                      </Box>
                      <Box flex="1.9" alignContent="center">
                        <Text color="orange.300" fontSize="sm">
                          You have ownership of {selectedDataNft.balance} Data NFTs (out of a total of {selectedDataNft.supply}). You can burn these{" "}
                          {selectedDataNft.balance} Data NFTs and remove them from your wallet.
                          {selectedDataNft.supply - selectedDataNft.balance > 0 &&
                            ` The remaining ${selectedDataNft.supply - selectedDataNft.balance} ${
                              selectedDataNft.supply - selectedDataNft.balance > 1 ? "are" : "is"
                            } not under your ownership.`}
                        </Text>
                      </Box>
                    </HStack>

                    <Text fontSize="md" mt="4">
                      Please note that Data NFTs not listed in the Data NFT marketplace are &quot;NOT public&quot; and are &quot;Private&quot; to only you so no
                      one can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not
                      be able to recover them again.
                    </Text>

                    <HStack mt="8">
                      <Text fontSize="md">How many do you want to burn?</Text>
                      <NumberInput
                        ml="3px"
                        size="sm"
                        maxW="24"
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
                      <Text ml="215px" color="red.400" fontSize="xs" mt="1 !important">
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
          <ListDataNFTModal
            isOpen={isListNFTOpen}
            onClose={onListNFTClose}
            nftData={selectedDataNft}
            marketContract={marketContract}
            sellerFee={item.sellerFee || 0}
            offer={{ wanted_token_identifier: contractsForChain(chainID).itheumToken, wanted_token_amount: price, wanted_token_nonce: 0 }}
            amount={amount}
            setAmount={setAmount}
          />
        )}

        <Modal isOpen={isAccessProgressModalOpen} onClose={cleanupAccessDataStreamProcess} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
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
                  {(!unlockAccessProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                  <Text>Verifying data access rights to unlock Data Stream</Text>
                </HStack>

                {unlockAccessProgress.s1 && unlockAccessProgress.s2 && (
                  <Stack border="solid .04rem" padding={3} borderRadius={5}>
                    <Text fontSize="sm" lineHeight={1.7}>
                      <InfoIcon boxSize={5} mr={1} />
                      Popups are needed for the Data Marshal to give you access to Data Streams. If your browser is prompting you to allow popups, please select{" "}
                      <b>Always allow pop-ups</b> and then close this and click on <b>View Data</b> again.
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
                {unlockAccessProgress.s1 && unlockAccessProgress.s2 && unlockAccessProgress.s3 && (
                  <Button colorScheme="teal" variant="outline" onClick={cleanupAccessDataStreamProcess}>
                    Close & Return
                  </Button>
                )}
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Skeleton>
  );
}
