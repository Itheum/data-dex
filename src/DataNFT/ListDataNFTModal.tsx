import React, { useEffect, useState } from "react";
import { Box, Text, Image, Modal, ModalOverlay, ModalContent, ModalBody, HStack, Flex, Button, Checkbox, Divider, useToast } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import { sleep } from "libs/util";
import { printPrice, convertToLocalString } from "libs/util2";
import { getAccountTokenFromApi } from "MultiversX/api";
import { getTokenWantedRepresentation } from "MultiversX/tokenUtils";
import { useChainMeta } from "store/ChainMetaContext";
import DataNFTLiveUptime from "UtilComps/DataNFTLiveUptime";
export type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sellerFee: number;
  nftData: any;
  offer: any;
  itheumPrice: number;
  marketContract: any;
  amount: number;
  setAmount: (amount: number) => void;
};

export default function ListDataNFTModal(props: ListModalProps) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const toast = useToast();
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const [feePrice, setFeePrice] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [liveUptimeFAIL, setLiveUptimeFAIL] = useState<boolean>(true);
  const [isLiveUptimeSuccessful, setIsLiveUptimeSuccessful] = useState<boolean>(false);

  useEffect(() => {
    if (_chainMeta.networkId && props.offer) {
      (async () => {
        // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
        const _token = await getAccountTokenFromApi(address, props.offer.wanted_token_identifier, _chainMeta.networkId);
        if (_token) {
          setWantedTokenBalance(_token.balance ? _token.balance : "0");
        } else {
          setWantedTokenBalance("0");
        }
      })();
    }
  }, [_chainMeta, props.offer]);

  useEffect(() => {
    if (props.offer) {
      setFeePrice(
        address !== props.nftData.creator
          ? printPrice(
              (props.amount * props.offer.wanted_token_amount * (10000 - props.sellerFee - props.nftData.royalties * 10000)) / 10000,
              getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)
            )
          : printPrice(
              (props.amount * props.offer.wanted_token_amount * (10000 - props.sellerFee)) / 10000,
              getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)
            )
      );
      setFee(props.offer.wanted_token_amount);
    }
  }, [props.offer]);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!props.sellerFee || !props.marketContract) {
      toast({
        title: "Data is not loaded",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!(props.offer && props.nftData)) {
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

    props.marketContract.addToMarket(props.nftData.collection, props.nftData.nonce, props.amount, props.offer.wanted_token_amount, address);
    props.setAmount(1);
    // a small delay for visual effect
    await sleep(0.5);
    props.onClose();
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalBody py={6}>
            <HStack spacing="5" alignItems="center">
              <Box flex="4" alignContent="center">
                <Text fontSize="lg">List Data NFTs on Marketplace</Text>
                <Flex mt="1">
                  <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                    {props.nftData.tokenName}
                  </Text>
                </Flex>
              </Box>
              <Box flex="1">
                <Image src={props.nftData.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
              </Box>
            </HStack>

            <Box>
              <Flex fontSize="md" mt="2">
                <Box w="140px">How many</Box>
                <Box>: {props.amount ? props.amount : 1}</Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Unlock Fee (per NFT)</Box>
                <Box>
                  {props.sellerFee ? (
                    <>
                      {": "}
                      {printPrice(
                        new BigNumber(props.offer.wanted_token_amount).toNumber(),
                        getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              {address !== props.nftData.creator && (
                <Flex fontSize="md" mt="2">
                  <Box w="140px">Royalties (per NFT)</Box>
                  <Box>
                    :{" "}
                    {`${convertToLocalString(props.nftData.royalties * 100)}% (${new BigNumber(props.offer.wanted_token_amount)
                      .multipliedBy(props.nftData.royalties)
                      .toNumber()} ${getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)})`}
                  </Box>
                </Flex>
              )}
              <Flex fontSize="md" mt="2">
                <Box w="140px">Seller Tax (per NFT)</Box>
                <Box>
                  :{" "}
                  {`${props.sellerFee / 100}% (${new BigNumber(props.offer.wanted_token_amount)
                    .multipliedBy(props.sellerFee)
                    .div(10000)
                    .toNumber()} ${getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)})`}
                </Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">You will receive</Box>
                <Box>
                  {": "}
                  {
                    <>
                      {feePrice} {fee && props.itheumPrice ? `(${convertToLocalString(fee * props.itheumPrice * props.amount, 2)} USD)` : ""}
                    </>
                  }
                </Box>
              </Flex>
              <Flex fontSize="xs" mt="0">
                <Box w="146px"></Box>
                <Box>
                  {
                    <>
                      {new BigNumber(props.offer.wanted_token_amount).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " + new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).toNumber() + " "}
                          {getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)}
                          {address != props.nftData.creator && (
                            <>
                              {" - "}
                              {new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).multipliedBy(props.nftData.royalties).toNumber()}
                              {" " + getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)}
                            </>
                          )}
                          {" - "}
                          {new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).multipliedBy(props.sellerFee).div(10000).toNumber()}
                          {" " + getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)}
                        </>
                      )}
                    </>
                  }
                </Box>
              </Flex>
            </Box>

            <DataNFTLiveUptime
              dataMarshal={props.nftData.dataMarshal}
              NFTId={props.nftData.id}
              handleFlagAsFailed={(hasFailed: boolean) => setLiveUptimeFAIL(hasFailed)}
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
                  new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).comparedTo(wantedTokenBalance) > 0 ||
                  !isLiveUptimeSuccessful
                }>
                Proceed
              </Button>
              <Button colorScheme="teal" size="sm" variant="outline" onClick={props.onClose}>
                Cancel
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
