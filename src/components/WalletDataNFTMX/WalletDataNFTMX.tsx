import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Container,
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
import {
  backendApi,
  convertToLocalString,
  decodeNativeAuthToken,
  getApiDataMarshal,
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
import ImageSlider from "components/ImageSlider";

export default function WalletDataNFTMX(item: any) {
  console.log(item);
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
  const [selectedDataNft, setSelectedDataNft] = useState<DataNft | undefined>();
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const [amount, setAmount] = useState(1);
  const [amountError, setAmountError] = useState("");
  const [price, setPrice] = useState(10);
  const [priceError, setPriceError] = useState("");
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const [webWalletListTxHash, setWebWalletListTxHash] = useState("");
  const maxListLimit = import.meta.env.VITE_MAX_LIST_LIMIT_PER_SFT ? Number(import.meta.env.VITE_MAX_LIST_LIMIT_PER_SFT) : 0;
  const maxListNumber = maxListLimit > 0 ? Math.min(maxListLimit, Number(item.balance)) : item.balance;
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
          txData.offeredTokenIdentifier,
          txData.offeredTokenNonce,
          txData.offeredTokenAmount,
          txData.title,
          txData.description,
          txData.wantedTokenIdentifier,
          txData.wantedTokenNonce,
          txData.wantedTokenAmount,
          txData.quantity,
          txData.owner
        );
      }
      sessionStorage.removeItem("web-wallet-tx");
    }
    item.setHasLoaded(false);
  }, [webWalletListTxHash]);

  async function addOfferBackend(
    txHash: string,
    offeredTokenIdentifier: string,
    offeredTokenNonce: string,
    offeredTokenAmount: string,
    title: string,
    description: string,
    wantedTokenIdentifier: string,
    wantedTokenNonce: string,
    wantedTokenAmount: string,
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
          offeredTokenIdentifier: offeredTokenIdentifier,
          offeredTokenNonce: offeredTokenNonce,
          offeredTokenAmount: offeredTokenAmount,
          title: title,
          description: description,
          wantedTokenIdentifier: wantedTokenIdentifier,
          wantedTokenNonce: wantedTokenNonce,
          wantedTokenAmount: wantedTokenAmount,
          quantity: quantity,
          owner: owner,
        };

        const response = await fetch(`${backendUrl}/addOffer`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        });
      }
    } catch (error) {
      console.error("Error:", error);
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
      if (!dataNft.dataMarshal || dataNft.dataMarshal === "") {
        dataNft.updateDataNft({ dataMarshal: getApiDataMarshal(chainID) });
      }
      const res = await dataNft.viewDataViaMVXNativeAuth(arg);

      if (res.error?.includes("403") && (nonce === 7 || nonce === 198)) {
        setUnlockAccessProgress((prevProgress) => ({
          ...prevProgress,
          s3: 2, // 2 means is bitz game
        }));
      }

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
      console.error(e);
      if (e.includes("403") && (nonce === 7 || nonce === 198)) {
        return;
      } else {
        setErrUnlockAccessGeneric(e.toString());
      }
    }
  }

  const cleanupAccessDataStreamProcess = () => {
    setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0 });
    setErrUnlockAccessGeneric("");
    onAccessProgressModalClose();
  };

  const onBurnButtonClick = (nft: DataNft) => {
    setSelectedDataNft(nft);
    onBurnNFTOpen();
  };

  const onListButtonClick = (nft: DataNft) => {
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
        h={item.isProfile === true ? "660px" : "870px"}
        mx="3 !important"
        border="1px solid transparent"
        borderColor="#00C79740"
        borderRadius="16px"
        mb="1rem"
        position="relative">
        <Container justifyContent="center" mt={"0"} h={"290px"} position={"relative"}>
          <Box position={"absolute"} style={{ marginTop: "1.5rem" }}>
            <ImageSlider
              imageUrls={item?.extraAssets ? [item.nftImgUrl, ...item.extraAssets] : [item.nftImgUrl]}
              autoSlide
              imageHeight="236px"
              imageWidth="236px"
              autoSlideInterval={Math.floor(Math.random() * 6000 + 6000)} // random number between 6 and 12 seconds
              onLoad={() => item.setHasLoaded(true)}
              // onError={({ currentTarget }) => {
              //   currentTarget.src = DEFAULT_NFT_IMAGE;
              // }}
            />{" "}
            {/* <Image
            src={item.nftImgUrl}
            alt={item.dataPreview}
            h={236}
            w={236}
            mx={6}
            mt={6}
            borderRadius="32px"
            onLoad={() => item.setHasLoaded(true)}
            onClick={() => item.openNftDetailsDrawer(item.id)}
          /> */}
          </Box>
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
              marginInlineStart: "1rem",
              marginInlineEnd: "1rem",
              marginTop: "1.5rem",
              borderRadius: "32px",
              cursor: "pointer",
              opacity: 0,
            }}
            onLoad={() => item.setHasLoaded(true)}
            onClick={() => item.openNftDetailsDrawer(item.id)}
            whileHover={{ opacity: 1, backdropFilter: "blur(1px)", backgroundColor: "#1b1b1ba0" }}>
            <Text as="div" border="1px solid" borderColor="teal.400" borderRadius="5px" variant="outline" w={20} h={8} textAlign="center" mx="20">
              <Text as="p" mt={1} fontWeight="400" textColor="white">
                Details
              </Text>
            </Text>
          </motion.button>
        </Container>

        <Flex h="28rem" mx={6} my={3} direction="column" justify={item.isProfile === true ? "initial" : "space-between"}>
          <Text fontSize="md" color="#929497">
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/nfts/${item.tokenIdentifier}`} isExternal>
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
                    {item.description && transformDescription(item.description)}
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
                  {item.description && transformDescription(item.description)}
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Box mt={1}>
            {item.creator && (
              <Box color="#8c8f92d0" fontSize="md" display="flex" alignItems="center">
                Creator:&nbsp;
                <Flex alignItems="center" onClick={() => navigate(`/profile/${item.creator}`)}>
                  <ShortAddress address={item.creator} fontSize="lg" tooltipLabel="Profile" />
                  <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797" }} fontSize="lg" />
                </Flex>
              </Box>
            )}

            {item.creationTime && (
              <Box color="#8c8f92d0" fontSize="md">
                Creation time: {moment(item.creationTime).format(uxConfig.dateStr)}
              </Box>
            )}

            <Stack display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" my="2" height="7rem">
              <Badge borderRadius="md" px="3" py="1" mt="1" colorScheme="teal">
                <Text fontSize={"sm"} fontWeight="semibold">
                  You are the {item.creator !== address ? "Owner" : "Creator"}
                </Text>
              </Badge>

              {item?.isDataNFTPH && (
                <Badge borderRadius="md" px="3" py="1" bgColor="#E2AEEA30">
                  <Text fontSize={"sm"} fontWeight="semibold" color={colorMode === "dark" ? "#E2AEEA" : "#af82b5"}>
                    Data NFT-PH (Plug-In Hybrid)
                  </Text>
                </Badge>
              )}

              <HStack mt="1">
                <Button
                  size="sm"
                  w="full"
                  borderRadius="lg"
                  fontSize="sm"
                  bgColor="#FF439D"
                  _hover={{ backgroundColor: "#FF439D70" }}
                  isDisabled={hasPendingTransactions}
                  hidden={item.isDataNFTPH}
                  onClick={() => onBurnButtonClick(item)}>
                  Burn
                </Button>

                <ExploreAppButton collection={item.collection} nonce={item.nonce} />
              </HStack>
            </Stack>
            <Box color="#8c8f92d0" fontSize="md" fontWeight="normal" my={2}>
              {item.balance === 0 ? `Balance: 1` : `Balance: ${item.balance}`} <br />
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

              {item.dataPreview && <PreviewDataButton previewDataURL={item.dataPreview} />}
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
                max={Number(maxListNumber)}
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
            offer={{
              wantedTokenIdentifier: contractsForChain(chainID).itheumToken,
              wantedTokenAmount: price.toString(),
              wantedTokenNonce: 0,
            }}
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
