import React, { useEffect, useState } from "react";
import {
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
  useToast,
  useColorMode,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Offer } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetLoginInfo, useGetNetworkConfig, useGetPendingTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import axios from "axios";

import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { contractsForChain } from "libs/config";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { sleep, printPrice, convertToLocalString, getTokenWantedRepresentation, backendApi, getApiDataMarshal, convertWeiToEsdt } from "libs/utils";
import { useMarketStore } from "store";
import { getOffersByIdAndNoncesFromBackendApi } from "../libs/MultiversX";
import { labels } from "../libs/language";

export type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sellerFee: number;
  nftData: any;
  offer: Partial<Offer>;
  marketContract: DataNftMarketContract;
  amount: number;
  setAmount: (amount: number) => void;
};

export default function ListDataNFTModal({ isOpen, onClose, sellerFee, nftData, offer, marketContract, amount, setAmount }: ListModalProps) {
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const toast = useToast();
  const fullPrice = amount * Number(offer.wantedTokenAmount);
  const priceWithSellerFee = fullPrice - (fullPrice * sellerFee) / 10000;
  const priceWithSellerFeeAndRoyalties = priceWithSellerFee - priceWithSellerFee * nftData.royalties;
  const feePrice =
    address !== nftData.creator
      ? printPrice(priceWithSellerFeeAndRoyalties, getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0))
      : printPrice(priceWithSellerFee, getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0));
  const fee = offer.wantedTokenAmount;
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [liveUptimeFAIL, setLiveUptimeFAIL] = useState<boolean>(true);
  const [isLiveUptimeSuccessful, setIsLiveUptimeSuccessful] = useState<boolean>(false);
  const [priceFromApi, setPriceFromApi] = useState<number>(-1);
  const { tokenLogin, loginMethod } = useGetLoginInfo();

  const backendUrl = backendApi(chainID);

  const { colorMode } = useColorMode();

  const isWebWallet = loginMethod === "wallet";

  const itheumPrice = useMarketStore((state) => state.itheumPrice);

  const [listTxSessionId, setListTxSessionId] = useState<string>("");
  const [listTxStatus, setListTxStatus] = useState<boolean>(false);
  const [listTxHash, setListTxHash] = useState<string>("");

  const trackTransactionStatus = useTrackTransactionStatus({
    transactionId: listTxSessionId,
  });

  const { pendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    if (!pendingTransactions[listTxSessionId]) return;
    const transactionHash = pendingTransactions[listTxSessionId].transactions[0].hash;
    setListTxHash(transactionHash);
  }, [pendingTransactions]);

  useEffect(() => {
    setListTxStatus(trackTransactionStatus.isSuccessful ? true : false);
  }, [trackTransactionStatus]);

  useEffect(() => {
    if (listTxStatus && !isWebWallet) {
      addOfferBackend();
      setAmount(1);
    }
  }, [listTxStatus]);

  async function addOfferBackend(
    txHash = listTxHash,
    offeredTokenIdentifier = nftData.collection,
    offeredTokenNonce = nftData.nonce,
    offeredTokenAmount = 1,
    title = nftData.title,
    description = nftData.description,
    wantedTokenIdentifier = offer.wantedTokenIdentifier,
    wantedTokenNonce = offer.wantedTokenNonce,
    wantedTokenAmount = Number(
      (Number(offer.wantedTokenAmount) + (Number(offer.wantedTokenAmount) * (marketRequirements.buyerTaxPercentage ?? 200)) / 10000) * Number(10 ** 18)
    ).toString(),
    quantity = amount * 1,
    owner = address
  ) {
    const indexResponse = await axios.get(
      `https://${getApi(chainID)}/accounts/${contractsForChain(chainID).market}/transactions?hashes=${txHash}&status=success&withScResults=true&withLogs=true`
    );

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

    try {
      const headers = {
        Authorization: `Bearer ${tokenLogin?.nativeAuthToken}`,
        "Content-Type": "application/json",
      };

      const requestBody = {
        index,
        offeredTokenIdentifier,
        offeredTokenNonce,
        offeredTokenAmount,
        title,
        description,
        wantedTokenIdentifier,
        wantedTokenNonce,
        wantedTokenAmount,
        quantity,
        owner,
      };

      const response = await fetch(`${backendUrl}/addOffer`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const onProcure = async () => {
    const showErrorToast = (title: string) => {
      toast({
        title,
        status: "error",
        isClosable: true,
      });
    };

    const conditions = [
      {
        condition: !address,
        errorMessage: "Connect your wallet",
      },
      {
        condition: !sellerFee || !marketContract,
        errorMessage: "Data is not loaded",
      },
      {
        condition: !(offer && nftData),
        errorMessage: "No NFT data",
      },
      {
        condition: !readTermsChecked,
        errorMessage: "You must READ and Agree on Terms of Use",
      },
    ];

    for (const { condition, errorMessage } of conditions) {
      if (condition) {
        showErrorToast(errorMessage);
        return;
      }
    }

    const { sessionId } = await marketContract.addToMarket(nftData.collection, nftData.nonce, amount, offer.wantedTokenAmount ?? 0, address);
    if (isWebWallet) {
      const price = Number(offer.wantedTokenAmount) + (Number(offer.wantedTokenAmount) * (marketRequirements.buyerTaxPercentage ?? 200)) / 10000;
      sessionStorage.setItem(
        "web-wallet-tx",
        JSON.stringify({
          type: "add-offer-tx",
          offeredTokenIdentifier: nftData.collection,
          offeredTokenNonce: nftData.nonce,
          offeredTokenAmount: 1,
          title: nftData.title,
          description: nftData.description,
          wantedTokenIdentifier: offer.wantedTokenIdentifier,
          wantedTokenNonce: offer.wantedTokenNonce,
          wantedTokenAmount: Number(price * Number(10 ** 18)).toString(),
          quantity: amount * 1,
          owner: address,
        })
      );
    }
    setListTxSessionId(sessionId);

    // a small delay for visual effect
    await sleep(0.5);

    onClose();
  };

  async function getTokenHistory(tokenIdArg: string) {
    try {
      const inputString = tokenIdArg;

      // Extracting identifier
      const identifier = inputString?.split("-").slice(0, 2).join("-");

      // Extracting nonce
      const nonceHex = inputString?.split("-")[2];
      const nonceDec = parseInt(nonceHex, 16);

      const _offers = await getOffersByIdAndNoncesFromBackendApi(chainID, identifier, [nonceDec]);
      const price = Math.min(..._offers.map((offerArg: any) => offerArg.wantedTokenAmount));
      if (price !== Infinity) {
        setPriceFromApi(price);
      } else {
        setPriceFromApi(-1);
      }
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

  useEffect(() => {
    getTokenHistory(nftData.id);
  }, [hasPendingTransactions]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <ModalBody py={6}>
            <HStack spacing="5" alignItems="center">
              <Box flex="4" alignContent="center">
                <Text fontSize="lg">List Data NFTs on Marketplace</Text>
                <Flex mt="1">
                  <Text
                    px="15px"
                    py="5px"
                    borderRadius="md"
                    fontWeight="bold"
                    fontSize="md"
                    backgroundColor={colorMode === "dark" ? "teal.400" : "teal.100"}
                    textAlign="center">
                    {nftData.tokenName}
                  </Text>
                </Flex>
              </Box>
              <Box flex="1">
                <Image src={nftData.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
              </Box>
            </HStack>

            {convertWeiToEsdt(priceFromApi).toNumber() -
              (Number(offer.wantedTokenAmount) + new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy(sellerFee).div(10000).toNumber()) >
              0 && (
              <Alert status="warning" rounded="lg" mt={3} fontSize="md">
                <AlertIcon />
                You want to list for{" "}
                {offer && Number(offer.wantedTokenAmount) + new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy(sellerFee).div(10000).toNumber()} ITHEUM
                which is lower by&nbsp;
                {(
                  ((convertWeiToEsdt(priceFromApi).toNumber() -
                    (Number(offer.wantedTokenAmount) +
                      BigNumber(offer.wantedTokenAmount ?? 0)
                        .multipliedBy(sellerFee)
                        .div(10000)
                        .toNumber())) *
                    100) /
                  convertWeiToEsdt(priceFromApi).toNumber()
                ).toFixed(2)}
                % than the current lowest price ({convertWeiToEsdt(priceFromApi).toNumber()} ITHEUM).
              </Alert>
            )}
            <Box>
              <Flex fontSize="md" mt="2">
                <Box w="140px">How many</Box>
                <Box>: {amount ? amount : 1}</Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Access Fee (per NFT)</Box>
                <Box>
                  {sellerFee ? (
                    <>
                      {": "}
                      {printPrice(
                        new BigNumber(offer.wantedTokenAmount ?? 0).toNumber(),
                        getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>

              <Flex fontSize="md" mt="2">
                <Box w="140px">Seller Tax (per NFT)</Box>
                <Box>
                  :{" "}
                  {`${sellerFee / 100}% (${new BigNumber(offer.wantedTokenAmount ?? 0)
                    .multipliedBy(sellerFee)
                    .div(10000)
                    .toNumber()} ${getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)})`}
                </Box>
              </Flex>

              {address !== nftData.creator && (
                <Flex fontSize="md" mt="2">
                  <Box w="140px">Royalties (per NFT)</Box>
                  <Box>
                    :{" "}
                    {`${convertToLocalString(nftData.royalties * 100)}% (${convertToLocalString(
                      new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy((1 - sellerFee / 10000) * nftData.royalties)
                    )} ${getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)})`}
                  </Box>
                </Flex>
              )}

              <Flex fontSize="md" mt="2">
                <Box w="140px">You will receive</Box>
                <Box>
                  {": "}
                  {
                    <>
                      {feePrice} {fee && itheumPrice ? `(~${convertToLocalString(Number(fee) * itheumPrice * amount, 2)} USD)` : ""}
                    </>
                  }
                </Box>
              </Flex>
              <Flex fontSize="xs" mt="0">
                <Box w="146px"></Box>
                <Box>
                  {
                    <>
                      {new BigNumber(offer.wantedTokenAmount ?? 0).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " + convertToLocalString(new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy(amount)) + " "}
                          {getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)}
                          {" - "}
                          {convertToLocalString(new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy(amount).multipliedBy(sellerFee).div(10000))}
                          {" " + getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)}
                          {address != nftData.creator && (
                            <>
                              {" - "}
                              {convertToLocalString(new BigNumber(offer.wantedTokenAmount ?? 0).multipliedBy((1 - sellerFee / 10000) * nftData.royalties))}
                              {" " + getTokenWantedRepresentation(offer.wantedTokenIdentifier ?? "", offer.wantedTokenNonce ?? 0)}
                            </>
                          )}
                        </>
                      )}
                    </>
                  }
                </Box>
              </Flex>
            </Box>

            <DataNFTLiveUptime
              dataMarshal={getApiDataMarshal(chainID)}
              NFTId={nftData.id}
              handleFlagAsFailed={(hasFailed: boolean) => setLiveUptimeFAIL(hasFailed)}
              isLiveUptimeSuccessful={isLiveUptimeSuccessful}
              setIsLiveUptimeSuccessful={setIsLiveUptimeSuccessful}
            />

            <Divider />

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

            <Flex justifyContent="end" mt="4 !important">
              <Button colorScheme="teal" size="sm" mx="3" onClick={onProcure} isDisabled={!readTermsChecked || liveUptimeFAIL || !isLiveUptimeSuccessful}>
                Proceed
              </Button>
              <Button colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
