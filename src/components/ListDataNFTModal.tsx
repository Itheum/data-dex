import React, { useState } from "react";
import { Box, Text, Image, Modal, ModalOverlay, ModalContent, ModalBody, HStack, Flex, Button, Checkbox, Divider, useToast } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import DataNFTLiveUptime from "components/UtilComps/DataNFTLiveUptime";
import { convertEsdtToWei, sleep, printPrice, convertToLocalString, getTokenWantedRepresentation } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";

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
  const { address } = useGetAccountInfo();
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

  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const itheumBalance = useAccountStore((state) => state.itheumBalance);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!sellerFee || !marketContract) {
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

    marketContract.addToMarket(nftData.collection, nftData.nonce, amount, offer.wanted_token_amount, address);
    setAmount(1);
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
                <Text fontSize="lg">List Data NFTs on Marketplace</Text>
                <Flex mt="1">
                  <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" textAlign="center">
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
                    {`${convertToLocalString(nftData.royalties * 100)}% (${convertToLocalString(new BigNumber(offer.wanted_token_amount)
                      .multipliedBy((1 - sellerFee / 10000) * nftData.royalties))} ${getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)})`}
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
