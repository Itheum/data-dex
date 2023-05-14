import React, { useEffect, useState } from "react";
import { Box, Text, Image, Modal, ModalOverlay, ModalContent, ModalBody, HStack, Flex, Button, Checkbox, Divider, useToast } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMetadataType, OfferType } from "libs/MultiversX/types";
import { convertEsdtToWei, convertWeiToEsdt, sleep, printPrice, convertToLocalString, tokenDecimals, getTokenWantedRepresentation } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";

export interface ProcureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerFee: number;
  nftData: DataNftMetadataType;
  offer: OfferType;
  amount: number;
  setSessionId?: (e: any) => void;
};

export default function ProcureDataNFTModal({
  isOpen,
  onClose,
  buyerFee,
  nftData,
  offer,
  amount,
  setSessionId,
}: ProcureAccessModalProps) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const toast = useToast();

  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  
  const feePrice = printPrice(
    convertWeiToEsdt(Number(offer.wanted_token_amount) * amount, tokenDecimals(offer.wanted_token_identifier)).toNumber(),
    getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
  );
  const fee = convertWeiToEsdt(offer.wanted_token_amount, tokenDecimals(offer.wanted_token_identifier)).toNumber();
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [liveUptimeFAIL, setLiveUptimeFAIL] = useState<boolean>(true);
  const [isLiveUptimeSuccessful, setIsLiveUptimeSuccessful] = useState<boolean>(false);

  // set ReadTermChecked checkbox as false when modal opened
  useEffect(() => {
    if (isOpen) {
      setReadTermsChecked(false);
    }
  }, [isOpen]);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!buyerFee || !marketContract) {
      toast({
        title: "Data is not loaded",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!(offer && nftData)) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!readTermsChecked) {
      toast({
        title: "You must READ and Agree on Terms of Use",
        status: "error",
        isClosable: true,
      });
      return;
    }

    const paymentAmount = new BigNumber(offer.wanted_token_amount).multipliedBy(amount);
    if (offer.wanted_token_identifier == "EGLD") {
      marketContract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amount, address);
    } else {
      if (offer.wanted_token_nonce === 0) {
        const { sessionId } = await marketContract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          amount,
          address
        );

        // if offer is sold out by this transaction, close Drawer if opened
        if (setSessionId && amount == offer.quantity) {
          setSessionId(sessionId);
        }
      } else {
        const { sessionId } = await marketContract.sendAcceptOfferNftEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          offer.wanted_token_nonce,
          amount,
          address
        );

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
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalBody py={6}>
            <HStack spacing="5" alignItems="center">
              <Box flex="4" alignContent="center">
                <Text fontSize="lg">Procure Access to Data NFTs</Text>
                <Flex mt="1">
                  <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
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
                          new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + buyerFee),
                          tokenDecimals(offer.wanted_token_identifier)
                        ).toNumber(),
                        getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex>
                {new BigNumber(offer.wanted_token_amount).multipliedBy(amount).comparedTo(convertEsdtToWei(itheumBalance)) > 0 && (
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
                        new BigNumber(offer.wanted_token_amount).multipliedBy(buyerFee).div(10000 + buyerFee),
                        tokenDecimals(offer.wanted_token_identifier)
                      ).toNumber()} ${getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)})`
                    : "-"}
                </Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Total Fee</Box>
                <Box>
                  {": "}
                  {buyerFee ? (
                    <>
                      {feePrice} {fee && itheumPrice ? `(${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}
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
                      {new BigNumber(offer.wanted_token_amount).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " +
                            convertWeiToEsdt(
                              new BigNumber(offer.wanted_token_amount)
                                .multipliedBy(amount)
                                .multipliedBy(10000)
                                .div(10000 + buyerFee),
                              tokenDecimals(offer.wanted_token_identifier)
                            ).toNumber() +
                            " "}
                          {getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}
                          {" + "}
                          {convertWeiToEsdt(
                            new BigNumber(offer.wanted_token_amount)
                              .multipliedBy(amount)
                              .multipliedBy(buyerFee)
                              .div(10000 + buyerFee),
                            tokenDecimals(offer.wanted_token_identifier)
                          ).toNumber()}
                          {" " + getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}
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
                  new BigNumber(offer.wanted_token_amount).multipliedBy(amount).comparedTo(convertEsdtToWei(itheumBalance)) > 0 ||
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