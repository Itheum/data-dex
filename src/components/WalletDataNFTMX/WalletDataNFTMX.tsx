import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Link,
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
import FrozenOverlay from "components/FrozenOverlay";
import PreviewDataButton from "components/PreviewDataButton";
import ExploreAppButton from "components/UtilComps/ExploreAppButton";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, PREVIEW_DATA_ON_DEVNET_SESSION_KEY, contractsForChain, uxConfig } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { labels } from "libs/language";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftType } from "libs/MultiversX/types";
import {
  backendApi,
  convertToLocalString,
  decodeNativeAuthToken,
  isValidNumericCharacter,
  shouldPreviewDataBeEnabled,
  sleep,
  transformDescription,
  viewDataDisabledMessage,
} from "libs/utils";
import { useMarketStore, useMintStore } from "store";
import AccessDataStreamModal from "./AccessDatastreamModal";
import BurnDataNFTModal from "./BurnDataNFTModal";
import ListDataNFTModal from "../ListDataNFTModal";

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
  const marketContract = new DataNftMarketContract(chainID);
  const [selectedDataNft, setSelectedDataNft] = useState<DataNftType | undefined>();
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const [amount, setAmount] = useState(1);
  const [amountError, setAmountError] = useState("");
  const [price, setPrice] = useState(10);
  const [priceError, setPriceError] = useState("");
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const [webWalletListTxHash, setWebWalletListTxHash] = useState("");
  const maxListLimit = import.meta.env.VITE_MAX_LIST_LIMIT_PER_SFT ? Number(import.meta.env.VITE_MAX_LIST_LIMIT_PER_SFT) : 0;
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

  async function accessDataStream(tokenIdentifier: string, nonce: number) {
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
      const dataNft = await DataNft.createFromApi({ tokenIdentifier, nonce });
      const arg = {
        mvxNativeAuthOrigins: [decodeNativeAuthToken(tokenLogin.nativeAuthToken).origin],
        mvxNativeAuthMaxExpirySeconds: 3600,
        fwdHeaderMapLookup: {
          "authorization": `Bearer ${tokenLogin.nativeAuthToken}`,
        },
      };
      const res = await dataNft.viewDataViaMVXNativeAuth(arg);

      if (!res.error) {
        const link = document.createElement("a");
        link.target = "_blank";
        link.download = `DataNFT-${nonce}`;
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
                label={viewDataDisabledMessage(loginMethod)}
                isDisabled={shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  w="full"
                  isDisabled={!shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}
                  onClick={() => {
                    accessDataStream(item.collection, item.nonce);
                  }}>
                  View Data
                </Button>
              </Tooltip>

              <PreviewDataButton previewDataURL={item.dataPreview} />
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

        <FrozenOverlay isVisible={userData && (userData?.addressFrozen || (userData?.frozenNonces && userData?.frozenNonces.includes(item?.nonce)))} />
        {selectedDataNft && <BurnDataNFTModal isOpen={isBurnNFTOpen} onClose={onBurnNFTClose} selectedDataNft={selectedDataNft} />}
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

        <AccessDataStreamModal
          isOpen={isAccessProgressModalOpen}
          onClose={cleanupAccessDataStreamProcess}
          unlockAccessProgress={unlockAccessProgress}
          errorMessage={errUnlockAccessGeneric}
        />
      </Box>
    </Skeleton>
  );
}
