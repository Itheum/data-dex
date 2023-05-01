import React, { useEffect, useState } from "react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  VStack,
  Text,
  Image,
  Stack,
  Flex,
  Badge,
  useToast,
  Spinner,
  useClipboard,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetPendingTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import axios from "axios";
import BigNumber from "bignumber.js";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, isValidNumericCharacter, uxConfig } from "libs/util";
import { convertToLocalString, printPrice, transformDescription } from "libs/util2";
import { getApi, getItheumPriceFromApi } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { getTokenWantedRepresentation, tokenDecimals } from "MultiversX/tokenUtils";
import { MarketplaceRequirementsType, OfferType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import TokenTxTable from "Tables/TokenTxTable";
import ShortAddress from "UtilComps/ShortAddress";
import ProcureDataNFTModal from "./ProcureDataNFTModal";

type DataNFTDetailsProps = {
  owner?: string;
  listed?: number;
  showConnectWallet?: boolean;
  tokenIdProp?: string;
  offerIdProp?: number;
  closeDetailsView?: () => void;
};

export default function DataNFTDetails(props: DataNFTDetailsProps) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { tokenId: tokenIdParam, offerId: offerIdParam } = useParams();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();

  const [nftData, setNftData] = useState<any>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const navigate = useNavigate();
  const [priceFromApi, setPriceFromApi] = useState<number>(0);
  const [itheumPrice, setItheumPrice] = useState<number>(0);

  const showConnectWallet = props.showConnectWallet || false;
  const toast = useToast();
  const tokenId = props.tokenIdProp || tokenIdParam; // priority 1 is tokenIdProp
  const offerId = props.offerIdProp || offerIdParam?.split("-")[1];
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);

  const { onCopy } = useClipboard(`${window.location.protocol + "//" + window.location.host}/datanfts/marketplace/${tokenId}/offer-${offerId}`);
  const [offer, setOffer] = useState<OfferType | undefined>();
  const [amount, setAmount] = useState<number>(1);
  const [amountError, setAmountError] = useState<string>("");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [sessionId, setSessionId] = useState<any>();

  useTrackTransactionStatus({
    transactionId: sessionId,
    onSuccess: () => {
      if (props.closeDetailsView) {
        props.closeDetailsView();
      }
    },
  });

  useEffect(() => {
    if (_chainMeta?.networkId) {
      getTokenDetails();
      getTokenHistory();

      (async () => {
        const _itheumPrice = await getItheumPriceFromApi();
        setItheumPrice(_itheumPrice || 0);
      })();

      (async () => {
        const _marketRequirements = await marketContract.viewRequirements();
        setMarketRequirements(_marketRequirements);
      })();
    }
  }, [_chainMeta, hasPendingTransactions]);

  useEffect(() => {
    if (_chainMeta.networkId && offerId != null) {
      (async () => {
        const _offer = await marketContract.viewOffer(Number(offerId));
        setOffer(_offer);
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

  function getTokenHistory() {
    const apiUrl = getApi(_chainMeta.networkId);
    axios
      .get(`https://${apiUrl}/nfts/${tokenId}/transactions?status=success&function=addOffer&size=1&receiver=${_chainMeta?.contracts?.market}`)
      .then((res) => {
        const txs = res.data;
        if (txs.length > 0) {
          const tx = txs[0];
          const hexPrice = Buffer.from(tx.data, "base64").toString().split("@")[8];
          let _price = 0;
          if (hexPrice.trim() !== "") {
            _price = parseInt("0x" + hexPrice, 16);
            if (marketRequirements) {
              _price += (_price * marketRequirements.buyer_fee) / 10000;
            }
          }
          setPriceFromApi(_price);
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

  function getListingText(price: number) {
    const esdtPrice = convertWeiToEsdt(price).toNumber();
    return esdtPrice > 0
      ? `Unlock for: ${esdtPrice} ITHEUM ` + (esdtPrice ? `(${convertToLocalString(esdtPrice * itheumPrice, 2)} USD)` : "")
      : esdtPrice === 0
      ? "Unlock for: FREE"
      : "Not Listed";
  }

  return (
    <Box>
      {!isLoadingNftData() ? (
        <Box mb="5">
          <Flex direction={"column"} alignItems={"flex-start"}>
            {tokenIdParam && (
              <>
                <Heading size="lg" marginBottom={4}>
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
            <Box width={"100%"} marginY={tokenIdParam ? "56px" : "30px"}>
              <Stack
                flexDirection={{ base: "column", md: "row" }}
                justifyContent={{ base: "center", md: "flex-start" }}
                alignItems={{ base: "center", md: "flex-start" }}>
                <Image boxSize={{ base: "240px", md: "400px" }} p={10} objectFit={"contain"} src={nftData.url} alt={"Data NFT Image"} />

                <VStack alignItems={"flex-start"} gap={"15px"}>
                  <Flex direction="row" alignItems="center" gap="3">
                    <Text fontSize="36px" noOfLines={2}>
                      {nftData.attributes?.title}
                    </Text>
                    {!!offerId && (
                      <Button
                        fontSize="xl"
                        onClick={() => {
                          onCopy();
                          toast({
                            title: "NFT detail page link is copied!",
                            status: "success",
                            isClosable: true,
                          });
                        }}>
                        <CopyIcon />
                      </Button>
                    )}
                  </Flex>

                  <Box color="gray.100" fontSize="xl">
                    <Link href={`${ChainExplorer}/nfts/${nftData.identifier}`} isExternal>
                      {nftData.identifier}
                      <ExternalLinkIcon mx="6px" />
                    </Link>
                  </Box>
                  <Flex direction={{ base: "column", md: "row" }} gap="3">
                    <Text fontSize={"32px"} color={"#89DFD4"} fontWeight={700} fontStyle={"normal"} lineHeight={"36px"}>
                      {!offer && getListingText(priceFromApi)}
                      {offer && getListingText(Number(offer.wanted_token_amount))}
                    </Text>
                    {showConnectWallet && (
                      <Button fontSize={{ base: "sm", md: "md" }} onClick={() => navigate("/")}>
                        Connect MultiversX Wallet
                      </Button>
                    )}
                  </Flex>
                  <Text fontSize={"22px"}>{transformDescription(nftData.attributes?.description)}</Text>
                  <Badge fontSize={"lg"} borderRadius="full" colorScheme="blue">
                    Fully Transferable License
                  </Badge>
                  <Flex direction={"column"} gap="1">
                    <Box color="gray.400" fontSize="lg">
                      Creator: <ShortAddress fontSize="lg" address={nftData.attributes?.creator}></ShortAddress>
                      <Link href={`${ChainExplorer}/accounts/${nftData.attributes?.creator}`} isExternal>
                        <ExternalLinkIcon mx="4px" />
                      </Link>
                    </Box>
                    {offer && offer.owner && (
                      <Box color="gray.400" fontSize="lg">
                        Owner: <ShortAddress fontSize="lg" address={offer.owner}></ShortAddress>
                        <Link href={`${ChainExplorer}/accounts/${offer.owner}`} isExternal>
                          <ExternalLinkIcon mx="4px" />
                        </Link>
                      </Box>
                    )}
                  </Flex>
                  <Box display="flex" justifyContent="flex-start">
                    <Text fontSize="lg">{`Creation time: ${moment(nftData.attributes?.creationTime).format(uxConfig.dateStr)}`}</Text>
                  </Box>
                  <Flex direction={"column"} gap="1" color="gray.400" fontSize="lg">
                    {!!nftData && (
                      <>
                        <Text>{`Total supply: ${nftData.supply}`}</Text>
                        <Text>
                          {`Royalty: `}
                          {!isNaN(nftData.royalties) ? `${Math.round(nftData.royalties * 100) / 100}%` : "-"}
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
                                convertWeiToEsdt(
                                  new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + marketRequirements.buyer_fee),
                                  tokenDecimals(offer.wanted_token_identifier)
                                ).toNumber(),
                                getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                              )}{" "}
                              {itheumPrice &&
                              convertWeiToEsdt(
                                new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + marketRequirements.buyer_fee),
                                tokenDecimals(offer.wanted_token_identifier)
                              ).toNumber() > 0
                                ? `(${convertToLocalString(
                                    convertWeiToEsdt(
                                      new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + marketRequirements.buyer_fee),
                                      tokenDecimals(offer.wanted_token_identifier)
                                    ).toNumber() * itheumPrice,
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

                  <Button
                    mt="2"
                    size="md"
                    colorScheme="teal"
                    height="7"
                    variant="outline"
                    onClick={() => {
                      window.open(nftData.attributes.dataPreview);
                    }}>
                    Preview Data
                  </Button>
                  {offer && address && address != offer.owner ? (
                    <Box>
                      <HStack>
                        <Text fontSize="md">How many to procure </Text>
                        <NumberInput
                          size="sm"
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
                        <Button size="sm" colorScheme="teal" width="72px" isDisabled={hasPendingTransactions || !!amountError} onClick={onProcureModalOpen}>
                          Procure
                        </Button>
                      </HStack>
                      <Text color="red.400" fontSize="sm" mt="1" ml="136px">
                        {amountError}
                      </Text>
                    </Box>
                  ) : (
                    <HStack h="2.4rem"></HStack>
                  )}
                </VStack>
              </Stack>
            </Box>
          </Flex>
          <VStack alignItems={"flex-start"}>
            <Heading size="lg" marginBottom={2}>
              Data NFT Activity
            </Heading>
            <Box width={"100%"}>
              <TokenTxTable page={1} tokenId={tokenId} offerId={offerId} />
            </Box>
          </VStack>

          {nftData && offer && (
            <ProcureDataNFTModal
              isOpen={isProcureModalOpen}
              onClose={onProcureModalClose}
              itheumPrice={itheumPrice || 0}
              marketContract={marketContract}
              buyerFee={marketRequirements?.buyer_fee || 0}
              nftData={nftData}
              offer={offer}
              amount={amount}
              setSessionId={setSessionId}
            />
          )}
        </Box>
      ) : (
        <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} minHeight={"500px"}>
          <Spinner size={"xl"} thickness="4px" speed="0.64s" emptyColor="gray.200" color="teal" label="Fetching Data NFT-FT details..." />
        </Flex>
      )}
    </Box>
  );
}
