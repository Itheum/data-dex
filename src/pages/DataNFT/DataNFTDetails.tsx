import React, { Fragment, useEffect, useState } from "react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useClipboard,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import axios from "axios";
import BigNumber from "bignumber.js";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProcureDataNFTModal from "components/ProcureDataNFTModal";
import TokenTxTable from "components/Tables/TokenTxTable";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, PREVIEW_DATA_ON_DEVNET_SESSION_KEY, uxConfig } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { OfferType } from "libs/MultiversX/types";
import {
  backendApi,
  convertToLocalString,
  convertWeiToEsdt,
  getTokenWantedRepresentation,
  isValidNumericCharacter,
  printPrice,
  tokenDecimals,
  transformDescription,
} from "libs/utils";
import { useMarketStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import ConditionalRender from "../../components/UtilComps/ApiWrapper";

type DataNFTDetailsProps = {
  owner?: string;
  listed?: number;
  showConnectWallet?: boolean;
  tokenIdProp?: string;
  offerIdProp?: number;
  closeDetailsView?: () => void;
};

export default function DataNFTDetails(props: DataNFTDetailsProps) {
  const { network } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { tokenId: tokenIdParam, offerId: offerIdParam } = useParams();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const toast = useToast();

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const isMarketPaused = useMarketStore((state) => state.isMarketPaused);
  const isApiUp = useMarketStore((state) => state.isApiUp);

  const [nftData, setNftData] = useState<any>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const navigate = useNavigate();
  const [priceFromApi, setPriceFromApi] = useState<number>(0);

  const showConnectWallet = props.showConnectWallet || false;
  const tokenId = props.tokenIdProp || tokenIdParam; // priority 1 is tokenIdProp
  const offerId = props.offerIdProp || offerIdParam?.split("-")[1];
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const marketContract = new DataNftMarketContract(_chainMeta.networkId);

  const backendApiRoute = backendApi(_chainMeta.networkId);

  const { onCopy } = useClipboard(`${window.location.protocol + "//" + window.location.host}/datanfts/marketplace/${tokenId}/offer-${offerId}`);
  const [offer, setOffer] = useState<OfferType | undefined>();
  const [totalOffers, setTotalOffers] = useState<Record<any, any>>({});
  const [amount, setAmount] = useState<number>(1);
  const [amountError, setAmountError] = useState<string>("");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [sessionId, setSessionId] = useState<any>();
  const marketplaceDrawer = "/datanfts/marketplace/market";
  const walletDrawer = "/datanfts/wallet";
  const { pathname } = useLocation();
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);

  // console.log(tokenId);
  useTrackTransactionStatus({
    transactionId: sessionId,
    onSuccess: () => {
      if (props.closeDetailsView) {
        props.closeDetailsView();
      } else {
        // it means current URL is NFT detail page; go to wallet after the offer is sold out
        navigate("/datanfts/wallet");
      }
    },
  });

  useEffect(() => {
    if (_chainMeta?.networkId) {
      getTokenDetails();
      getTokenHistory(tokenId ?? "");
    }
  }, [_chainMeta, hasPendingTransactions]);

  useEffect(() => {
    if (_chainMeta.networkId && offerId != null && !sessionId) {
      // if sessionId exists, it means the offer is going to be sold out by user
      (async () => {
        const _offer = await marketContract.viewOffer(Number(offerId));
        setOffer(_offer);
        // console.log(_offer);
      })();
    }
  }, [_chainMeta, offerId, hasPendingTransactions]);

  function getTokenDetails() {
    const apiLink = getApi(_chainMeta.networkId);
    const nftApiLink = `https://${apiLink}/nfts/${tokenId}`;
    axios
      .get(nftApiLink)
      .then((res) => {
        const _nftData = res.data;
        const attributes = new DataNftMintContract(_chainMeta.networkId).decodeNftAttributes(_nftData);
        _nftData.attributes = attributes;
        setNftData(_nftData);
        // console.log(_nftData);
        setIsLoadingDetails(false);
      })
      .catch((err) => {
        toast({
          id: "er3",
          title: "ER3: Could not fetch Data NFT-FT details",
          description: err.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  }

  function getTokenHistory(tokenId: string) {
    const inputString = tokenId;

    // Extracting identifier
    const identifier = inputString?.split("-").slice(0, 2).join("-");

    // Extracting nonce
    const nonceHex = inputString?.split("-")[2];
    const nonceDec = parseInt(nonceHex, 16);

    axios
      .get(`${backendApiRoute}offers/${identifier}?nonces=${nonceDec}`)
      .then((res) => {
        // console.log(res.data);
        if (res.data) {
          setTotalOffers(res.data);
        }
        let price = Math.min(...res.data.map((offer: any) => offer.price));

        if (price !== Infinity) {
          if (marketRequirements) {
            price += (price * marketRequirements.buyer_fee) / 10000;
          }
          setPriceFromApi(price);
        } else {
          setPriceFromApi(-1);
        }
        setIsLoadingPrice(false);
      })
      .catch((err) => {
        toast({
          id: "er3",
          title: "ER3: Could not fetch Data NFT-FT details",
          description: err.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  }

  function isLoadingNftData() {
    return isLoadingDetails || isLoadingPrice;
  }

  function getListingText(price: number, isApi: boolean) {
    const esdtPrice = isApi ? price : convertWeiToEsdt(price).toNumber();
    return esdtPrice > 0
      ? `Unlock for: ${esdtPrice} ITHEUM ` + (esdtPrice ? `(~${convertToLocalString(esdtPrice * itheumPrice, 2)} USD)` : "")
      : esdtPrice === 0
      ? "Unlock for: FREE"
      : "Not Listed";
  }
  function getOfferPrice(price: number, isApi: boolean) {
    const esdtPrice = isApi ? price : convertWeiToEsdt(price).toNumber();
    return esdtPrice > 0
      ? `• ${esdtPrice} ITHEUM ` + (esdtPrice ? `(~${convertToLocalString(esdtPrice * itheumPrice, 2)} USD)` : "")
      : esdtPrice === 0
      ? "Unlock for: FREE"
      : "Not Listed";
  }

  const handleButtonClick = (offer: number, identifier: string) => {
    return `/datanfts/marketplace/${identifier}/offer-${offer}`;
  };

  return (
    <Box mx={tokenIdParam ? { base: "5 !important", xl: "28 !important" } : 0}>
      {!isLoadingNftData() ? (
        <Box mb="5">
          <Flex direction={"column"} alignItems={"flex-start"}>
            {tokenIdParam && (
              <>
                <Heading size="lg" marginBottom={4} marginTop={10}>
                  Data NFT Marketplace
                </Heading>
                <HStack>
                  <Button
                    colorScheme="teal"
                    width={{ base: "120px", md: "160px" }}
                    _disabled={{ opacity: 1 }}
                    fontSize={{ base: "sm", md: "md" }}
                    onClick={() => {
                      navigate("/datanfts/marketplace/market");
                    }}
                    marginRight={2}>
                    Public Marketplace
                  </Button>
                </HStack>
              </>
            )}
            <Box width={"100%"} marginY={tokenIdParam ? "56px" : "30px"} border="1px solid" borderColor="#00C79740" borderRadius="xl">
              <Stack
                flexDirection={{ base: "column", lg: "row" }}
                m={5}
                justifyContent={{ base: "center", lg: "flex-start" }}
                alignItems={{ base: "center", lg: "flex-start" }}>
                <Image
                  boxSize={{ base: "260px", lg: "330px" }}
                  p={10}
                  objectFit={"contain"}
                  src={nftData.url}
                  alt={"Data NFT Image"}
                  mr={pathname === marketplaceDrawer ? 0 : { base: 0, lg: 14 }}
                />

                <VStack alignItems={"flex-start"} gap={"15px"} w="full">
                  <Box color={colorMode === "dark" ? "white" : "black"} fontSize={{ base: "lg", lg: "xl" }}>
                    <Link href={`${ChainExplorer}/nfts/${nftData.identifier}`} isExternal>
                      {nftData.identifier}
                      <ExternalLinkIcon ml="6px" mb="1" fontSize={{ base: "md", lg: "xl" }} color="teal.200" />
                    </Link>
                  </Box>

                  <Flex direction="row" alignItems="center" gap="3">
                    <Text fontSize={pathname === marketplaceDrawer ? "38px" : { base: "25px", lg: "48px" }} noOfLines={2} fontWeight="semibold">
                      {nftData.attributes?.title}
                    </Text>
                    {!!offerId && (
                      <Button
                        size={{ base: "md", lg: "xl" }}
                        onClick={() => {
                          onCopy();
                          toast({
                            title: "NFT detail page link is copied!",
                            status: "success",
                            isClosable: true,
                          });
                        }}>
                        <CopyIcon color="teal.200" fontSize={{ base: "md", lg: "xl" }} />
                      </Button>
                    )}
                  </Flex>

                  <Flex direction={{ base: "column", md: "row" }} gap="3" mt={"-2 !important"} mb={pathname === marketplaceDrawer ? 0 : "25px !important"}>
                    <Text fontSize={{ base: "18px", lg: "28px" }} color={"teal.200"} fontWeight={500} fontStyle={"normal"} lineHeight={"36px"}>
                      {!offer && getListingText(priceFromApi, true)}
                      {offer && getListingText(Number(offer.wanted_token_amount), false)}
                    </Text>
                    {showConnectWallet && (
                      <Button fontSize={{ base: "sm", md: "md" }} onClick={() => navigate("/")}>
                        Connect MultiversX Wallet
                      </Button>
                    )}
                  </Flex>
                  <Box border="1px solid" borderColor="#00C79740" borderRadius="2xl" w="full">
                    <Heading fontSize="20px" fontWeight={500} pl="28px" py={5} borderBottom="1px solid" borderColor="#00C79740" bgColor="#00C7970D">
                      Description
                    </Heading>
                    <Text fontSize={"16px"} px="28px" py="14px">
                      {transformDescription(nftData.attributes?.description)}
                    </Text>
                    <Box borderRadius="md" py="1.5" bgColor="#E2AEEA30" w="11rem" ml="28px" textAlign="center">
                      <Text fontSize={{ base: "xs", "2xl": "sm" }} fontWeight="semibold" color="#E2AEEA">
                        Fully Transferable License
                      </Text>
                    </Box>
                    <Flex direction={"column"} gap="1" px="28px" mt="3">
                      <Box color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light">
                        Creator: <ShortAddress fontSize="lg" address={nftData.attributes?.creator}></ShortAddress>
                        <Link href={`${ChainExplorer}/accounts/${nftData.attributes?.creator}`} isExternal>
                          <ExternalLinkIcon mx="4px" fontSize="lg" />
                        </Link>
                      </Box>
                      {offer && offer.owner && (
                        <Box color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light">
                          Owner: <ShortAddress fontSize="lg" address={offer.owner}></ShortAddress>
                          <Link href={`${ChainExplorer}/accounts/${offer.owner}`} isExternal>
                            <ExternalLinkIcon mx="4px" fontSize="lg" />
                          </Link>
                        </Box>
                      )}
                      <Box display="flex" justifyContent="flex-start" pb="14px">
                        <Text color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light">{`Creation time: ${moment(
                          nftData.attributes?.creationTime
                        ).format(uxConfig.dateStr)}`}</Text>
                      </Box>
                    </Flex>
                  </Box>
                  <Box border="1px solid" borderColor="#00C79740" borderRadius="2xl" w="full">
                    <Heading fontSize="20px" fontWeight={500} pl="28px" py={5} borderBottom="1px solid" borderColor="#00C79740" bgColor="#00C7970D">
                      Details
                    </Heading>
                    <Flex direction={"column"} gap="1" px="28px" py="14px" color={colorMode === "dark" ? "white" : "black"} fontSize="lg">
                      {!!nftData && (
                        <>
                          <Text>{`Total supply: ${nftData.supply}`}</Text>
                          <Text>
                            {`Royalty: `}
                            {!isNaN(nftData.royalties) ? `${convertToLocalString(Math.round(nftData.royalties * 100) / 100)}%` : "-"}
                          </Text>
                        </>
                      )}
                      {!!offerId && (
                        <>
                          <Text>{`Listed: ${offer ? offer.quantity : "-"}`}</Text>
                          <Text>
                            {`Unlock Fee per NFT: `}
                            {marketRequirements && offer ? (
                              <>
                                {printPrice(
                                  convertWeiToEsdt(new BigNumber(offer.wanted_token_amount), tokenDecimals(offer.wanted_token_identifier)).toNumber(),
                                  getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                                )}{" "}
                                {itheumPrice &&
                                convertWeiToEsdt(new BigNumber(offer.wanted_token_amount), tokenDecimals(offer.wanted_token_identifier)).toNumber() > 0
                                  ? `(~${convertToLocalString(
                                      convertWeiToEsdt(new BigNumber(offer.wanted_token_amount), tokenDecimals(offer.wanted_token_identifier)).toNumber() *
                                        itheumPrice,
                                      2
                                    )} USD)`
                                  : ""}
                              </>
                            ) : (
                              "-"
                            )}
                          </Text>
                        </>
                      )}
                    </Flex>
                  </Box>

                  <ConditionalRender fallback={<></>} checkFunction={isApiUp}>
                    {!offer && (
                      <>
                        <Box border="1px solid" borderColor="#00C79740" borderRadius="2xl" w="full">
                          <Heading fontSize="20px" fontWeight={500} pl="28px" py={5} borderBottom="1px solid" borderColor="#00C79740" bgColor="#00C7970D">
                            {totalOffers.length === 1 ? `${totalOffers.length} Offer:` : totalOffers.length === 0 ? "Offers:" : `${totalOffers.length} Offers:`}
                            {}
                            <Text color={"teal.200"}>{nftData.identifier}</Text>
                          </Heading>
                          <Grid templateColumns="repeat(7, 1fr)" maxH="18rem" overflowY="scroll" gap={2} px="28px" py="14px">
                            {(totalOffers.length === 0 || totalOffers === null) && (
                              <GridItem colSpan={8}>
                                <NoDataHere imgFromTop="0" />
                              </GridItem>
                            )}
                            {!(totalOffers.length === 0 || totalOffers === null) && (
                              <>
                                <GridItem flexDirection="column" colSpan={4} fontSize="xl" fontWeight="500" py={2}>
                                  Price
                                </GridItem>
                                <GridItem flexDirection="column" colSpan={1} fontSize="xl" fontWeight="500" py={2}>
                                  Quantity
                                </GridItem>
                              </>
                            )}
                            <GridItem flexDirection="column" colSpan={2} fontSize="xl" fontWeight="500" textAlign="center"></GridItem>
                            {totalOffers &&
                              totalOffers.map((to: any, index: number) => (
                                <Fragment key={index}>
                                  <GridItem flexDirection="column" colSpan={4}>
                                    {marketRequirements && getOfferPrice(to.price + to.price * (marketRequirements?.buyer_fee / 10000), true)}
                                  </GridItem>
                                  <GridItem flexDirection="column" colSpan={1}>
                                    {to.listed_supply}
                                  </GridItem>
                                  <GridItem colSpan={2}>
                                    <a target="_blank" href={handleButtonClick(to.index, nftData.identifier)} rel="noopener noreferrer">
                                      <Button w="full" colorScheme="teal" variant="outline">
                                        {tokenId && pathname?.includes(tokenId) ? "View Data" : "View"}
                                      </Button>
                                    </a>
                                  </GridItem>
                                </Fragment>
                              ))}
                          </Grid>
                        </Box>
                      </>
                    )}
                  </ConditionalRender>

                  {offer && address && address != offer.owner && (
                    <Box>
                      <HStack gap={5}>
                        <Text fontSize="xl">How many to procure </Text>
                        <NumberInput
                          size="md"
                          maxW={24}
                          step={1}
                          min={1}
                          max={offer.quantity}
                          isValidCharacter={isValidNumericCharacter}
                          value={amount}
                          defaultValue={1}
                          onChange={(valueAsString) => {
                            const value = Number(valueAsString);
                            let error = "";
                            if (value <= 0) {
                              error = "Cannot be zero or negative";
                            } else if (value > offer.quantity) {
                              error = "Cannot exceed balance";
                            }
                            setAmountError(error);
                            setAmount(value);
                          }}>
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                      <Text color="red.400" fontSize="sm" mt="2" ml="190px">
                        {amountError}
                      </Text>
                    </Box>
                  )}
                  <Flex flexDirection="row" gap={5} justifyContent={{ base: "center", lg: "start" }} w="full">
                    <Tooltip colorScheme="teal" hasArrow placement="top" label="Market is paused" isDisabled={!isMarketPaused}>
                      <Button
                        size={{ base: "md", lg: "lg" }}
                        colorScheme="teal"
                        isDisabled={hasPendingTransactions || !!amountError || isMarketPaused}
                        hidden={!isMxLoggedIn || pathname === walletDrawer || !offer || address === offer.owner}
                        onClick={onProcureModalOpen}>
                        <Text px={tokenId ? 0 : 3}>Purchase Data</Text>
                      </Button>
                    </Tooltip>

                    <Tooltip
                      colorScheme="teal"
                      hasArrow
                      label="Preview Data is disabled on devnet"
                      isDisabled={network.id != "devnet" || !!previewDataOnDevnetSession}>
                      <Button
                        size={{ base: "md", lg: "lg" }}
                        colorScheme="teal"
                        variant="outline"
                        isDisabled={network.id == "devnet" && !previewDataOnDevnetSession}
                        onClick={() => {
                          window.open(nftData.attributes.dataPreview);
                        }}>
                        <Text px={tokenId ? 0 : 3}>Preview Data</Text>
                      </Button>
                    </Tooltip>
                  </Flex>
                </VStack>
              </Stack>
            </Box>
          </Flex>
          <VStack alignItems={"flex-start"}>
            <Heading size="lg" fontWeight="500" marginBottom={2}>
              Data NFT Activity
            </Heading>
            <Box width={"100%"}>
              <TokenTxTable page={1} tokenId={tokenId} offerId={offerId} buyer_fee={marketRequirements?.buyer_fee} />
            </Box>
          </VStack>

          {nftData && offer && (
            <ProcureDataNFTModal
              isOpen={isProcureModalOpen}
              onClose={onProcureModalClose}
              buyerFee={marketRequirements?.buyer_fee || 0}
              nftData={nftData.attributes}
              offer={offer}
              amount={amount}
              setSessionId={setSessionId}
            />
          )}
        </Box>
      ) : (
        <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} minHeight={"500px"}>
          <Spinner size={"xl"} thickness="4px" speed="0.64s" emptyColor="gray.200" color="teal.200" label="Fetching Data NFT-FT details..." />
        </Flex>
      )}
    </Box>
  );
}
