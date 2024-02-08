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
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo, useGetNetworkConfig, useGetSignedTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMetadataType } from "libs/MultiversX/types";
import {
  convertEsdtToWei,
  convertWeiToEsdt,
  sleep,
  printPrice,
  convertToLocalString,
  tokenDecimals,
  getTokenWantedRepresentation,
  backendApi,
} from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import { Offer } from "@itheum/sdk-mx-data-nft/out";

export interface ProcureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerFee: number;
  nftData: DataNftMetadataType;
  offer: Offer;
  amount: number;
  setSessionId?: (e: any) => void;
}

export default function ProcureDataNFTModal({ isOpen, onClose, buyerFee, nftData, offer, amount, setSessionId }: ProcureAccessModalProps) {
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const toast = useToast();

  const { colorMode } = useColorMode();

  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const marketContract = new DataNftMarketContract(chainID);

  const { tokenLogin, loginMethod } = useGetLoginInfo();

  const isWebWallet = loginMethod === "wallet";

  const backendUrl = backendApi(chainID);

  const feePrice = printPrice(
    convertWeiToEsdt(Number(offer.wantedTokenAmount) * amount, tokenDecimals(offer.wantedTokenIdentifier)).toNumber(),
    getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)
  );
  const fee = convertWeiToEsdt(offer.wantedTokenAmount, tokenDecimals(offer.wantedTokenIdentifier)).toNumber();
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [liveUptimeFAIL, setLiveUptimeFAIL] = useState<boolean>(true);
  const [isLiveUptimeSuccessful, setIsLiveUptimeSuccessful] = useState<boolean>(false);

  const [purchaseSessionId, setPurchaseSessionId] = useState<string>("");
  const [purchaseTxStatus, setPurchaseTxStatus] = useState<boolean>(false);

  const trackPurchaseTxStatus = useTrackTransactionStatus({
    transactionId: purchaseSessionId,
  });

  const { hasSignedTransactions, signedTransactionsArray } = useGetSignedTransactions();

  useEffect(() => {
    if (!isWebWallet) return;
    if (!hasSignedTransactions) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const session = signedTransactionsArray[0][0];
    } catch (e) {
      sessionStorage.removeItem("web-wallet-tx");
    }

    const sessionInfo = sessionStorage.getItem("web-wallet-tx");
    if (sessionInfo) {
      const { type, index, amount: amountt } = JSON.parse(sessionInfo);
      if (type == "purchase-tx") {
        updateOfferOnBackend(index, amountt);
        sessionStorage.removeItem("web-wallet-tx");
      }
    }
  }, [hasSignedTransactions]);

  useEffect(() => {
    setPurchaseTxStatus(trackPurchaseTxStatus.isPending ? true : false);
  }, [trackPurchaseTxStatus]);

  useEffect(() => {
    if (purchaseTxStatus && !isWebWallet) {
      updateOfferOnBackend();
    }
  }, [purchaseTxStatus]);

  // set ReadTermChecked checkbox as false when modal opened
  useEffect(() => {
    if (isOpen) {
      setReadTermsChecked(false);
    }
  }, [isOpen]);

  async function updateOfferOnBackend(index = offer.index, supply = amount) {
    try {
      const headers = {
        Authorization: `Bearer ${tokenLogin?.nativeAuthToken}`,
        "Content-Type": "application/json",
      };

      const requestBody = { supply: supply };
      const response = await fetch(`${backendUrl}/updateOffer/${index}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log("Response:", response.ok);
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

  const onProcure = async () => {
    const conditions = [
      {
        condition: !address,
        errorMessage: "Connect your wallet",
      },
      {
        condition: !buyerFee || !marketContract,
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

    const paymentAmount = new BigNumber(offer.wantedTokenAmount).multipliedBy(amount);

    if (offer.wantedTokenIdentifier == "EGLD") {
      marketContract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amount, address);
    } else {
      if (offer.wantedTokenNonce === 0) {
        //Check if we buy all quantity, use web wallet and are on that offer's details page and thus should use callback route
        const isOnOfferPage = window.location.pathname.includes("/offer-");
        const shouldUseCallbackRoute = isWebWallet && amount == offer.quantity && isOnOfferPage;
        const callbackRoute = "/datanfts/wallet";

        const { sessionId } = await marketContract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wantedTokenIdentifier,
          amount as never,
          address,
          shouldUseCallbackRoute ? callbackRoute : undefined
        );
        setPurchaseSessionId(sessionId);
        if (isWebWallet) {
          sessionStorage.setItem("web-wallet-tx", JSON.stringify({ type: "purchase-tx", index: offer.index, amount: amount }));
        }
        // if offer is sold out by this transaction, close Drawer if opened
        if (setSessionId && amount == offer.quantity) {
          setSessionId(sessionId);
        }
      } else {
        const { sessionId } = await marketContract.sendAcceptOfferNftEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wantedTokenIdentifier,
          offer.wantedTokenNonce,
          amount as never,
          address
        );
        setPurchaseSessionId(sessionId);
        if (isWebWallet) {
          sessionStorage.setItem("web-wallet-tx", JSON.stringify({ type: "purchase-tx", index: offer.index, amount: amount }));
        }
        // if offer is sold out by this transaction, close Drawer if opened
        if (setSessionId && amount == offer.quantity) {
          setSessionId(sessionId);
        }
      }
    }

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
                <Text fontSize="lg">Procure Access to Data NFTs</Text>
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
                <Box w="140px">Unlock Fee (per NFT)</Box>
                <Box>
                  :{" "}
                  {buyerFee ? (
                    <>
                      {printPrice(
                        convertWeiToEsdt(
                          new BigNumber(offer.wantedTokenAmount).multipliedBy(10000).div(10000 + buyerFee),
                          tokenDecimals(offer.wantedTokenIdentifier)
                        ).toNumber(),
                        getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex>
                {new BigNumber(offer.wantedTokenAmount).multipliedBy(amount).comparedTo(convertEsdtToWei(itheumBalance)) > 0 && (
                  <Text ml="146" color="red.400" fontSize="xs" mt="1 !important">
                    Your wallet token balance is too low to proceed
                  </Text>
                )}
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Buyer Tax (per NFT)</Box>
                <Box>
                  :{" "}
                  {buyerFee
                    ? `${buyerFee / 100}% (${convertWeiToEsdt(
                        new BigNumber(offer.wantedTokenAmount).multipliedBy(buyerFee).div(10000 + buyerFee),
                        tokenDecimals(offer.wantedTokenIdentifier)
                      ).toNumber()} ${getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)})`
                    : "-"}
                </Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Total Fee</Box>
                <Box>
                  {": "}
                  {buyerFee ? (
                    <>
                      {feePrice} {fee && itheumPrice ? `(~${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex fontSize="xs" mt="0">
                <Box w="146px"></Box>
                <Box>
                  {buyerFee ? (
                    <>
                      {new BigNumber(offer.wantedTokenAmount).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " +
                            convertWeiToEsdt(
                              new BigNumber(offer.wantedTokenAmount)
                                .multipliedBy(amount)
                                .multipliedBy(10000)
                                .div(10000 + buyerFee),
                              tokenDecimals(offer.wantedTokenIdentifier)
                            ).toNumber() +
                            " "}
                          {getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)}
                          {" + "}
                          {convertWeiToEsdt(
                            new BigNumber(offer.wantedTokenAmount)
                              .multipliedBy(amount)
                              .multipliedBy(buyerFee)
                              .div(10000 + buyerFee),
                            tokenDecimals(offer.wantedTokenIdentifier)
                          ).toNumber()}
                          {" " + getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)}
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
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
              <Button
                colorScheme="teal"
                size="sm"
                mx="3"
                onClick={onProcure}
                isDisabled={
                  !readTermsChecked ||
                  liveUptimeFAIL ||
                  new BigNumber(offer.wantedTokenAmount).multipliedBy(amount).comparedTo(convertEsdtToWei(itheumBalance)) > 0 ||
                  !isLiveUptimeSuccessful
                }>
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
