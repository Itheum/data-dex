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
  list,
} from "@chakra-ui/react";
import {
  useGetAccountInfo,
  useGetAccountProvider,
  useGetLoginInfo,
  useGetNetworkConfig,
  useGetPendingTransactions,
  useGetSignedTransactions,
  useTrackTransactionStatus,
} from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { sleep, printPrice, convertToLocalString, getTokenWantedRepresentation, backendApi } from "libs/utils";
import { useMarketStore } from "store";
import axios from "axios";
import { getApi } from "libs/MultiversX/api";
import { contractsForChain } from "libs/config";

export type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sellerFee: number;
  nftData: any;
  offer: any;
  marketContract: any;
  amount: number;
  setAmount: (amount: number) => void;
};

export default function ListDataNFTModal({ isOpen, onClose, sellerFee, nftData, offer, marketContract, amount, setAmount }: ListModalProps) {
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const marketRequirements = useMarketStore((state) => state.marketRequirements);

  const toast = useToast();
  const fullPrice = amount * offer.wanted_token_amount;
  const priceWithSellerFee = fullPrice - (fullPrice * sellerFee) / 10000;
  const priceWithSellerFeeAndRoyalties = priceWithSellerFee - priceWithSellerFee * nftData.royalties;
  const feePrice =
    address !== nftData.creator
      ? printPrice(priceWithSellerFeeAndRoyalties, getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce))
      : printPrice(priceWithSellerFee, getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce));
  const fee = offer.wanted_token_amount;
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [liveUptimeFAIL, setLiveUptimeFAIL] = useState<boolean>(true);
  const [isLiveUptimeSuccessful, setIsLiveUptimeSuccessful] = useState<boolean>(false);
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
    offered_token_identifier = nftData.collection,
    offered_token_nonce = nftData.nonce,
    offered_token_amount = 1,
    title = nftData.title,
    description = nftData.description,
    wanted_token_identifier = offer.wanted_token_identifier,
    wanted_token_nonce = offer.wanted_token_nonce,
    wanted_token_amount = Number(Number(offer.wanted_token_amount) * Number(10 ** 18)).toString(),
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

    const { sessionId } = await marketContract.addToMarket(nftData.collection, nftData.nonce, amount, offer.wanted_token_amount, address);
    if (isWebWallet) {
      const price = Number(offer.wanted_token_amount) + (Number(offer.wanted_token_amount) * (marketRequirements?.buyer_fee ?? 200)) / 10000;
      sessionStorage.setItem(
        "web-wallet-tx",
        JSON.stringify({
          type: "add-offer-tx",
          offered_token_identifier: nftData.collection,
          offered_token_nonce: nftData.nonce,
          offered_token_amount: 1,
          title: nftData.title,
          description: nftData.description,
          wanted_token_identifier: offer.wanted_token_identifier,
          wanted_token_nonce: offer.wanted_token_nonce,
          wanted_token_amount: Number(price * Number(10 ** 18)).toString(),
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
                        new BigNumber(offer.wanted_token_amount).toNumber(),
                        getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
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
                  {`${sellerFee / 100}% (${new BigNumber(offer.wanted_token_amount)
                    .multipliedBy(sellerFee)
                    .div(10000)
                    .toNumber()} ${getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)})`}
                </Box>
              </Flex>

              {address !== nftData.creator && (
                <Flex fontSize="md" mt="2">
                  <Box w="140px">Royalties (per NFT)</Box>
                  <Box>
                    :{" "}
                    {`${convertToLocalString(nftData.royalties * 100)}% (${convertToLocalString(
                      new BigNumber(offer.wanted_token_amount).multipliedBy((1 - sellerFee / 10000) * nftData.royalties)
                    )} ${getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)})`}
                  </Box>
                </Flex>
              )}

              <Flex fontSize="md" mt="2">
                <Box w="140px">You will receive</Box>
                <Box>
                  {": "}
                  {
                    <>
                      {feePrice} {fee && itheumPrice ? `(~${convertToLocalString(fee * itheumPrice * amount, 2)} USD)` : ""}
                    </>
                  }
                </Box>
              </Flex>
              <Flex fontSize="xs" mt="0">
                <Box w="146px"></Box>
                <Box>
                  {
                    <>
                      {new BigNumber(offer.wanted_token_amount).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " + convertToLocalString(new BigNumber(offer.wanted_token_amount).multipliedBy(amount)) + " "}
                          {getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}
                          {" - "}
                          {convertToLocalString(new BigNumber(offer.wanted_token_amount).multipliedBy(amount).multipliedBy(sellerFee).div(10000))}
                          {" " + getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}
                          {address != nftData.creator && (
                            <>
                              {" - "}
                              {convertToLocalString(new BigNumber(offer.wanted_token_amount).multipliedBy((1 - sellerFee / 10000) * nftData.royalties))}
                              {" " + getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}
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
              dataMarshal={nftData.dataMarshal}
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
