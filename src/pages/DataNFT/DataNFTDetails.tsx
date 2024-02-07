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
import { FaStore } from "react-icons/fa";
import { MdOutlineInfo } from "react-icons/md";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PreviewDataButton from "components/PreviewDataButton";
import ProcureDataNFTModal from "components/ProcureDataNFTModal";
import { NoDataHere } from "components/Sections/NoDataHere";
import TokenTxTable from "components/Tables/TokenTxTable";
import ConditionalRender from "components/UtilComps/ApiWrapper";
import ExploreAppButton from "components/UtilComps/ExploreAppButton";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, PREVIEW_DATA_ON_DEVNET_SESSION_KEY, uxConfig } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { labels } from "libs/language";
import { getFavoritesFromBackendApi, getOffersByIdAndNoncesFromBackendApi } from "libs/MultiversX";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { OfferType } from "libs/MultiversX/types";
import {
  convertToLocalString,
  convertWeiToEsdt,
  getTokenWantedRepresentation,
  isValidNumericCharacter,
  printPrice,
  tokenDecimals,
  transformDescription,
} from "libs/utils";
import { useMarketStore } from "store";
import { Favourite } from "../../components/Favourite/Favourite";

type DataNFTDetailsProps = {
  owner?: string;
  listed?: number;
  showConnectWallet?: boolean;
  tokenIdProp?: string;
  offerIdProp?: number;
  closeDetailsView?: () => void;
};

export default function DataNFTDetails(props: DataNFTDetailsProps) {
  const { chainID } = useGetNetworkConfig();
  const { tokenLogin, isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { colorMode } = useColorMode();
  const { tokenId: tokenIdParam, offerId: offerIdParam } = useParams();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
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

  const chainExplorer = CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER];
  const marketContract = new DataNftMarketContract(chainID);

  const { onCopy } = useClipboard(`${window.location.protocol + "//" + window.location.host}/datanfts/marketplace/${tokenId}/offer-${offerId}`);
  const [offer, setOffer] = useState<OfferType | undefined>();
  const [totalOffers, setTotalOffers] = useState<Record<any, any>>({});
  const [amount, setAmount] = useState<number>(1);
  const [amountError, setAmountError] = useState<string>("");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [sessionId, setSessionId] = useState<any>();
  const [addressHasNft, setAddressHasNft] = useState<boolean>(false);
  const marketplaceDrawer = "/datanfts/marketplace/market";
  const walletDrawer = "/datanfts/wallet";
  const { pathname } = useLocation();
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const [favouriteItems, setFavouriteItems] = React.useState<Array<string>>([]);

  const maxBuyLimit = import.meta.env.VITE_MAX_BUY_LIMIT_PER_SFT ? Number(import.meta.env.VITE_MAX_BUY_LIMIT_PER_SFT) : 0;
  const maxBuyNumber = offer && maxBuyLimit > 0 ? Math.min(maxBuyLimit, offer.quantity) : offer?.quantity;

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken = tokenLogin?.nativeAuthToken;
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites);
      setFavouriteItems(getFavourites);
    }
  };

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

  const getAddressTokenInformation = () => {
    const apiLink = getApi(chainID);
    const nftApiLink = `https://${apiLink}/accounts/${address}/nfts/${tokenId}`;

    axios
      .get(nftApiLink)
      .then((res) => {
        if (res.data.identifier == tokenId) {
          setAddressHasNft(true);
        }
      })
      .catch((err) => {
        if (err) {
          setAddressHasNft(false);
        }
      });
  };

  useEffect(() => {
    getTokenDetails();
    getAddressTokenInformation();
    getTokenHistory(tokenId ?? "");
    getFavourite();
  }, [hasPendingTransactions]);

  useEffect(() => {
    if (offerId != null && !sessionId) {
      // if sessionId exists, it means the offer is going to be sold out by user
      (async () => {
        const _offer = await marketContract.viewOffer(Number(offerId));
        if (_offer === null || _offer === undefined) {
          if (!toast.isActive("ER-24")) {
            toast({
              id: "ER-24",
              title: labels.ERR_MARKET_OFFER_NOT_FOUND,
              description: "We are showing Data NFT Details and other available offers below",
              status: "warning",
              position: "top",
              duration: null,
              isClosable: true,
              containerStyle: {
                marginTop: "1rem",
              },
            });
          }
        }
        setOffer(_offer);
      })();
    }
  }, [offerId, hasPendingTransactions]);
  function getTokenDetails() {
    const apiLink = getApi(chainID);
    const nftApiLink = `https://${apiLink}/nfts/${tokenId}`;

    axios
      .get(nftApiLink)
      .then((res) => {
        const _nftData = res.data;
        const attributes = new DataNftMintContract(chainID).decodeNftAttributes(_nftData);
        _nftData.attributes = attributes;
        setNftData(_nftData);
        setIsLoadingDetails(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          toast({
            title: labels.ERR_MARKET_OFFER_NOT_FOUND,
            description: err.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        } else {
          toast({
            title: labels.ERR_API_ISSUE_DATA_NFT_DETAILS,
            description: err.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
      });
  }

  async function getTokenHistory(tokenIdArg: string) {
    try {
      const inputString = tokenIdArg;

      // Extracting identifier
      const identifier = inputString?.split("-").slice(0, 2).join("-");

      // Extracting nonce
      const nonceHex = inputString?.split("-")[2];
      const nonceDec = parseInt(nonceHex, 16);

      const _offers = await getOffersByIdAndNoncesFromBackendApi(chainID, identifier, [nonceDec]);
      setTotalOffers(_offers);
      const price = Math.min(..._offers.map((offerArg: any) => offerArg.wanted_token_amount));
      if (price !== Infinity) {
        setPriceFromApi(price);
      } else {
        setPriceFromApi(-1);
      }
      setIsLoadingPrice(false);
    } catch (err) {
      if ((err as any).response.status === 404) {
        toast({
          title: labels.ERR_MARKET_OFFER_NOT_FOUND,
          description: (err as Error).message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: labels.ERR_API_ISSUE_DATA_NFT_OFFERS,
          description: (err as Error).message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  }

  function isLoadingNftData() {
    return isLoadingDetails || isLoadingPrice;
  }

  function getListingText(price: number) {
    const esdtPrice = convertWeiToEsdt(price).toNumber();
    return esdtPrice > 0
      ? `Unlock for: ${esdtPrice} ITHEUM ` + (esdtPrice ? `(~${convertToLocalString(esdtPrice * itheumPrice, 2)} USD)` : "")
      : esdtPrice === 0
        ? "Unlock for: FREE"
        : "Not Listed";
  }

  function getOfferPrice(price: number) {
    const esdtPrice = convertWeiToEsdt(price).toNumber();
    return esdtPrice > 0
      ? `• ${esdtPrice} ITHEUM ` + (esdtPrice ? `(~${convertToLocalString(esdtPrice * itheumPrice, 2)} USD)` : "")
      : esdtPrice === 0
        ? "Unlock for: FREE"
        : "Not Listed";
  }

  const handleButtonClick = (offerArg: number, identifier: string) => {
    return `/datanfts/marketplace/${identifier}/offer-${offerArg}`;
  };

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (tokenId) {
      setSearchParams({ tokenId: tokenId });
    }
  }, []);

  return (
    <Box mx={tokenIdParam ? { base: "5 !important", xl: "28 !important" } : 0}>
      {!isLoadingNftData() ? (
        <Box mb="5">
          <Flex direction={"column"} alignItems={"flex-start"}>
            {tokenIdParam && (
              <Box display={{ md: "Flex" }} justifyContent="space-between" w="100%">
                <Heading size="xl" fontFamily="Clash-Medium" marginBottom={4} marginTop={10}>
                  Data NFT Details
                </Heading>
                <HStack>
                  <Button
                    marginTop={{ md: "25px" }}
                    colorScheme="teal"
                    _disabled={{ opacity: 1 }}
                    fontSize={{ base: "sm", md: "md" }}
                    leftIcon={<FaStore />}
                    variant="outline"
                    onClick={() => {
                      navigate("/datanfts/marketplace/market");
                    }}
                    marginRight={2}>
                    Visit Public Marketplace
                  </Button>
                </HStack>
              </Box>
            )}
            <Box width={"100%"} marginY={tokenIdParam ? "20px" : "10px"} border="1px solid" borderColor="#00C79740" borderRadius="xl">
              <Stack flexDirection="column" m={5} justifyContent={{ base: "center", xl: "flex-start" }} alignItems={{ base: "center", xl: "flex-start" }}>
                <Flex flexDirection={{ base: "column", xl: "row" }} w="full" alignItems={{ base: "center", md: "initial" }} justifyContent="space-between">
                  <Image
                    w={{ base: "210px", xl: "260px" }}
                    h={{ base: "210px", xl: "260px" }}
                    py={2}
                    objectFit={"contain"}
                    src={nftData.url}
                    alt={"Data NFT Image"}
                    mr={pathname === marketplaceDrawer ? 0 : { base: 0, lg: 0 }}
                  />
                  <Flex mr={2}>
                    <Flex flexDirection="column" ml={5} h="250px" justifyContent="space-evenly">
                      <Box display="flex" gap={3} color={colorMode === "dark" ? "white" : "black"} fontSize={{ base: "md", md: "lg", xl: "xl" }}>
                        <Link href={`${chainExplorer}/nfts/${nftData.identifier}`} isExternal>
                          {nftData.identifier}
                          <ExternalLinkIcon ml="6px" mb="1" fontSize={{ base: "md", lg: "xl" }} color="teal.200" />
                        </Link>
                        <Favourite
                          chainID={chainID}
                          tokenIdentifier={nftData.identifier}
                          bearerToken={tokenLogin?.nativeAuthToken}
                          favouriteItems={favouriteItems}
                          getFavourites={getFavourite}
                        />
                      </Box>

                      <Flex direction="row" alignItems="center" gap="3" w={{ base: "initial", xl: "25rem" }}>
                        <Tooltip label={nftData.attributes?.title}>
                          <Text fontSize={"32px"} fontFamily="Clash-Medium" noOfLines={1} fontWeight="light" lineHeight="10">
                            {nftData.attributes?.title}
                          </Text>
                        </Tooltip>
                        {!!offerId && (
                          <Button
                            variant="ghost"
                            size={{ base: "sm", lg: "sm" }}
                            onClick={() => {
                              onCopy();
                              toast({
                                title: "NFT detail page link is copied!",
                                status: "success",
                                isClosable: true,
                              });
                            }}>
                            <CopyIcon color="teal.200" fontSize={{ base: "md", lg: "xl" }} textAlign="left" />
                          </Button>
                        )}
                      </Flex>

                      <Flex direction={{ base: "column", md: "row" }} gap="3" mt={"-2 !important"} mb={pathname === marketplaceDrawer ? 0 : "25px !important"}>
                        <Text fontSize={{ base: "18px", md: "22px" }} color={"teal.200"} fontWeight={500} fontStyle={"normal"} lineHeight={"36px"}>
                          {!offer && getListingText(priceFromApi)}
                          {offer && getListingText(Number(offer.wanted_token_amount))}
                        </Text>
                        {showConnectWallet && (
                          <Button fontSize={{ base: "sm", md: "md" }} onClick={() => navigate("/")}>
                            Connect MultiversX Wallet
                          </Button>
                        )}
                      </Flex>
                      {offer && address && address != offer.owner && (
                        <Box h={14}>
                          <HStack gap={5}>
                            <Text fontSize="xl">How many to procure </Text>
                            <NumberInput
                              size="md"
                              maxW={24}
                              step={1}
                              min={1}
                              max={maxBuyNumber}
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
                                } else if (maxBuyLimit > 0 && value > maxBuyLimit) {
                                  error = "Cannot exceed max buy limit";
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
                      <Flex flexDirection="row" gap={3} justifyContent={{ base: "center", lg: "start" }} w="full">
                        <Tooltip colorScheme="teal" hasArrow placement="top" label="Market is paused" isDisabled={!isMarketPaused}>
                          <Button
                            size={{ base: "sm", md: "md", xl: "lg" }}
                            colorScheme="teal"
                            isDisabled={hasPendingTransactions || !!amountError || isMarketPaused}
                            hidden={!isMxLoggedIn || pathname === walletDrawer || !offer || address === offer.owner}
                            onClick={onProcureModalOpen}>
                            <Text px={tokenId ? 0 : 3} fontSize={{ base: "xs", md: "sm", xl: "md" }}>
                              Purchase Data
                            </Text>
                          </Button>
                        </Tooltip>

                        <PreviewDataButton
                          previewDataURL={nftData.attributes.dataPreview}
                          buttonSize={{ base: "sm", md: "md", xl: "lg" }}
                          buttonWidth="unset"
                        />
                        <ExploreAppButton
                          nonce={nftData.nonce}
                          size={{ base: "sm", md: "md", xl: "lg" }}
                          w={{ base: "auto", xl: "5rem" }}
                          fontSize={{ base: "xs", md: "sm", xl: "md" }}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  <Box
                    border="1px solid"
                    borderColor="#00C79740"
                    borderRadius="2xl"
                    mt={3}
                    justifyContent="right"
                    w={marketplaceDrawer ? { base: "full", md: "initial", xl: "26.3rem", "2xl": "29rem" } : { base: "full", md: "initial", xl: "inherit" }}>
                    <Heading
                      fontSize="20px"
                      fontFamily="Clash-Medium"
                      fontWeight="semibold"
                      pl="28px"
                      py={5}
                      borderBottom="1px solid"
                      borderColor="#00C79740"
                      bgColor="#00C7970D"
                      borderTopRadius="xl">
                      Details
                    </Heading>
                    <Flex direction={"column"} gap="1" px="28px" py="14px" color={colorMode === "dark" ? "white" : "black"} fontSize="lg">
                      {!!nftData && (
                        <>
                          <Text>{`Total supply: ${nftData.supply ? nftData.supply : 1}`}</Text>
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
                </Flex>

                <Grid templateColumns="repeat(8, 1fr)" gap={3} w="full" marginTop="1.5rem !important">
                  <GridItem colSpan={{ base: 8, xl: 5 }}>
                    <Box border="1px solid" borderColor="#00C79740" borderRadius="2xl" w="full">
                      <Heading
                        fontSize="20px"
                        fontFamily="Clash-Medium"
                        fontWeight="semibold"
                        pl="28px"
                        py={8}
                        borderBottom="1px solid"
                        borderColor="#00C79740"
                        bgColor="#00C7970D"
                        borderTopRadius="xl">
                        Description
                      </Heading>
                      <Flex flexDirection="column" h="18.6rem" justifyContent="space-between">
                        <Text fontSize={"16px"} px="28px" py="14px" h="inherit" overflow={"auto"} scrollBehavior="auto" mb={2}>
                          {transformDescription(nftData.attributes?.description)}
                        </Text>
                        <Flex flexDirection="row" gap={3}>
                          <Box
                            borderRadius="md"
                            px="3"
                            py="1.5"
                            bgColor="#E2AEEA30"
                            w="11rem"
                            ml="28px"
                            textAlign="center"
                            display="flex"
                            alignItems="center"
                            justifyContent="center">
                            <Text fontSize={"sm"} fontWeight="semibold" color="#E2AEEA">
                              Fully Transferable License
                            </Text>
                          </Box>
                          {addressHasNft && (
                            <Box
                              mr="28px"
                              borderRadius="md"
                              px="1.5"
                              py="1.5"
                              bgColor="#0ab8ff30"
                              textAlign="center"
                              display="flex"
                              alignItems="center"
                              justifyContent="center">
                              <Text fontSize={"sm"} fontWeight="semibold" color="#0ab8ff">
                                You are Owner
                              </Text>
                            </Box>
                          )}
                        </Flex>
                        <Flex direction={{ base: "column", md: "row" }} gap={2} px="28px" mt="3" justifyContent="space-between">
                          <Box color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light" display="flex">
                            Creator:&nbsp;
                            <Flex
                              onClick={() => {
                                if (props.closeDetailsView) {
                                  props.closeDetailsView();
                                }
                                navigate(`/profile/${nftData.attributes?.creator}`);
                              }}>
                              <ShortAddress address={nftData.attributes?.creator} fontSize="lg" tooltipLabel="Profile" />
                              <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797", marginTop: "4px" }} fontSize="lg" />
                            </Flex>
                          </Box>
                          {offer && offer.owner && (
                            <Box color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light" display="flex">
                              Owner:&nbsp;
                              <Flex
                                onClick={() => {
                                  if (props.closeDetailsView) {
                                    props.closeDetailsView();
                                  }
                                  navigate(`/profile/${offer.owner}`);
                                }}>
                                <ShortAddress address={offer.owner} fontSize="lg" tooltipLabel="Profile" />
                                <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797", marginTop: "4px" }} fontSize="lg" />
                              </Flex>
                            </Box>
                          )}
                          <Box display="flex" justifyContent="flex-start" pb="14px">
                            <Text color={colorMode === "dark" ? "white" : "black"} fontSize="lg" fontWeight="light">{`Creation time: ${moment(
                              nftData.attributes?.creationTime
                            ).format(uxConfig.dateStr)}`}</Text>
                          </Box>
                        </Flex>
                      </Flex>
                    </Box>
                  </GridItem>
                  <GridItem colSpan={{ base: 8, xl: 3 }}>
                    <ConditionalRender fallback={<></>} checkFunction={isApiUp}>
                      <Box border="1px solid" borderColor="#00C79740" borderRadius="2xl" w="full">
                        <Heading
                          fontSize="20px"
                          fontFamily="Clash-Medium"
                          fontWeight="semibold"
                          pl="28px"
                          py={5}
                          borderBottom="1px solid"
                          borderColor="#00C79740"
                          bgColor="#00C7970D"
                          borderTopRadius="xl">
                          <>
                            {!offer ? (
                              <>
                                {totalOffers.length === 2
                                  ? `One offer:`
                                  : totalOffers.filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index)).length === 0
                                    ? "No other offers"
                                    : `${totalOffers.filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index)).length} Offers:`}
                              </>
                            ) : (
                              <>
                                {totalOffers.length === 2 /// 2 here because we are always going to have the current offer and the other one
                                  ? `One other offer:`
                                  : totalOffers.filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index)).length === 0
                                    ? "No other offers"
                                    : `${totalOffers.filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index)).length} other offers:`}
                              </>
                            )}
                          </>
                          {}
                          <Text color={"teal.200"}>{nftData.identifier}</Text>
                        </Heading>
                        <Box flex="1" overflowY="scroll" h="18.6rem" px="28px" py="14px">
                          {totalOffers.length === 0 ||
                          false ||
                          (totalOffers.length === 1 && totalOffers[0].owner === address) ||
                          totalOffers.filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index)).length === 0 ? (
                            <Box flex="1" display="flex" justifyContent="center" alignItems="center">
                              <NoDataHere imgFromTop="6.5rem" />
                            </Box>
                          ) : (
                            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                              <>
                                <GridItem flexDirection="column" colSpan={2} fontSize="lg" fontWeight="500" py={2}>
                                  Price
                                </GridItem>
                                <GridItem flexDirection="column" colSpan={1} fontSize="lg" fontWeight="500" py={2}>
                                  Quantity
                                </GridItem>
                                <GridItem colSpan={1} fontSize="lg" fontWeight="500" textAlign="center" rowSpan={1}></GridItem>
                              </>
                              {totalOffers &&
                                totalOffers
                                  .filter((to: any) => (offerId ? to.index !== Number(offerId) : to.index))
                                  .map((to: any, index: number) => (
                                    <Fragment key={index}>
                                      <GridItem flexDirection="column" colSpan={2} fontSize="sm">
                                        {marketRequirements && getOfferPrice(Number(to.wanted_token_amount))}
                                      </GridItem>
                                      <GridItem flexDirection="column" colSpan={1} fontSize="sm">
                                        {to.quantity}
                                      </GridItem>
                                      <GridItem colSpan={1}>
                                        {tokenId && pathname?.includes(tokenId) ? (
                                          <a href={handleButtonClick(to.index, nftData.identifier)} rel="noopener noreferrer">
                                            <Button w="full" colorScheme="teal" variant="outline" size="sm">
                                              {window.innerWidth > 500 ? "View Offer" : "View"}
                                            </Button>
                                          </a>
                                        ) : (
                                          <a target="_blank" href={handleButtonClick(to.index, nftData.identifier)} rel="noopener noreferrer">
                                            <Button w="full" colorScheme="teal" variant="outline" size="sm">
                                              {window.innerWidth > 500 ? "View Offer" : "View"}
                                            </Button>
                                          </a>
                                        )}
                                      </GridItem>
                                    </Fragment>
                                  ))}
                            </Grid>
                          )}
                        </Box>
                      </Box>
                    </ConditionalRender>
                  </GridItem>
                </Grid>
              </Stack>
            </Box>
          </Flex>

          <VStack alignItems={"flex-start"}>
            <Heading size="lg" fontFamily="Clash-Medium" mt="30px" marginBottom={2}>
              Data NFT Activity
            </Heading>

            <Flex width={"100%"} overflowX="scroll">
              <TokenTxTable page={1} tokenId={tokenId} offerId={offerId} buyer_fee={marketRequirements.buyerTaxPercentage} />
            </Flex>
          </VStack>

          {nftData && offer && (
            <ProcureDataNFTModal
              isOpen={isProcureModalOpen}
              onClose={onProcureModalClose}
              buyerFee={marketRequirements.buyerTaxPercentage || 0}
              nftData={nftData.attributes}
              offer={offer}
              amount={amount}
              setSessionId={setSessionId}
            />
          )}
        </Box>
      ) : (
        <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} minHeight={"500px"}>
          <Spinner size="xl" color="teal.200" margin="auto !important" label="Fetching Data NFT-FT details..." />
        </Flex>
      )}
    </Box>
  );
}
