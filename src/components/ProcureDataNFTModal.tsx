import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, Divider, Flex, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Text, useColorMode, useToast } from "@chakra-ui/react";
import { DataNft, Offer } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetLoginInfo, useGetNetworkConfig, useGetSignedTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { updateOfferSupplyOnBackend } from "libs/MultiversX";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import {
  convertEsdtToWei,
  convertToLocalString,
  convertWeiToEsdt,
  getApiDataMarshal,
  getTokenWantedRepresentation,
  printPrice,
  sleep,
  tokenDecimals,
} from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import NftMediaComponent from "./NftMediaComponent";

let lastNotifiedPurchaseWasSuccessMS = 0;

export interface ProcureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerFee: number;
  nftData: Partial<DataNft>;
  offer: Offer;
  amount: number;
  setSessionId?: (e: any) => void;
  showCustomMintMsg?: boolean;
  notifyPurchaseWasSuccess?: () => void;
}

export default function ProcureDataNFTModal({
  isOpen,
  onClose,
  buyerFee,
  nftData,
  offer,
  amount,
  setSessionId,
  showCustomMintMsg,
  notifyPurchaseWasSuccess,
}: ProcureAccessModalProps) {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const marketContract = new DataNftMarketContract(chainID);
  const { tokenLogin, loginMethod } = useGetLoginInfo();
  const isWebWallet = loginMethod === "wallet";
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
        updateOfferSupplyOnBackend(chainID, tokenLogin?.nativeAuthToken ?? "", index, amountt);
        sessionStorage.removeItem("web-wallet-tx");
      }
    }
  }, [hasSignedTransactions]);

  useEffect(() => {
    setPurchaseTxStatus(trackPurchaseTxStatus.isPending ? true : false);

    // tx was a success, so notify the host
    if (trackPurchaseTxStatus.isSuccessful) {
      const nowEpochMS = Date.now();

      /* a interim way to throttle report back notifyPurchaseWasSuccess calls (as MVX keeps firing events)
      ... and if we don't do this, and if the user buys again on same page, they wont get the CTA alert or the CTA model keeps refiring even on close */
      if (nowEpochMS - lastNotifiedPurchaseWasSuccessMS > 15000) {
        lastNotifiedPurchaseWasSuccessMS = nowEpochMS;

        if (notifyPurchaseWasSuccess) {
          notifyPurchaseWasSuccess();
        }
      }
    }
  }, [trackPurchaseTxStatus]);

  useEffect(() => {
    if (purchaseTxStatus && !isWebWallet) {
      updateOfferSupplyOnBackend(chainID, tokenLogin?.nativeAuthToken ?? "", offer.index, amount);
    }
  }, [purchaseTxStatus]);

  // set ReadTermChecked checkbox as false when modal opened
  useEffect(() => {
    if (isOpen) {
      setReadTermsChecked(false);
    }
  }, [isOpen]);

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
      marketContract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amount, address, showCustomMintMsg);
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
          shouldUseCallbackRoute ? callbackRoute : undefined,
          showCustomMintMsg
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
        const { sessionId } = await marketContract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wantedTokenIdentifier,
          amount,
          address,
          "",
          showCustomMintMsg
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
                <Text fontSize="lg">{showCustomMintMsg ? "Mint Data NFTs" : "Buy Data NFTs"}</Text>
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
                <NftMediaComponent nftMedia={nftData?.media} imageHeight={"120px"} imageWidth="120px" borderRadius="md" />
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
                      {feePrice} {fee && itheumPrice ? `(~${convertToLocalString(amount * fee * itheumPrice, 2)} USD)` : ""}
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
              dataMarshal={getApiDataMarshal(chainID)}
              NFTId={nftData.tokenIdentifier ?? ""}
              tokenName={nftData.tokenName}
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
