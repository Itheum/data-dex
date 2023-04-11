import React, { useEffect, useState } from "react";
import { Box, Text, Image, Modal, ModalOverlay, ModalContent, ModalBody, HStack, Flex, Button, Checkbox, useDisclosure, useToast } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import { convertWeiToEsdt, sleep } from "libs/util";
import { printPrice, convertToLocalString } from "libs/util2";
import { getAccountTokenFromApi } from "MultiversX/api";
import { tokenDecimals, getTokenWantedRepresentation } from "MultiversX/tokenUtils";
import { OfferType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
export type ProcureAccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buyerFee: number;
  nftData: any;
  offer: OfferType;
  itheumPrice: number;
  marketContract: any;
  amount: number;
  setSessionId?: (e: any) => void;
};

export default function ProcureDataNFTModal(props: ProcureAccessModalProps) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const toast = useToast();
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const [feePrice, setFeePrice] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const [readTermsChecked, setReadTermsChecked] = useState(false);

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
        printPrice(
          convertWeiToEsdt(Number(props.offer.wanted_token_amount) * props.amount, tokenDecimals(props.offer.wanted_token_identifier)).toNumber(),
          getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)
        )
      );
      setFee(convertWeiToEsdt(props.offer.wanted_token_amount, tokenDecimals(props.offer.wanted_token_identifier)).toNumber());
    }
  }, [props]);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!props.buyerFee || !props.marketContract) {
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

    const paymentAmount = new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount);
    if (props.offer.wanted_token_identifier == "EGLD") {
      props.marketContract.sendAcceptOfferEgldTransaction(props.offer.index, paymentAmount.toFixed(), props.amount, address);
    } else {
      if (props.offer.wanted_token_nonce === 0) {
        const { sessionId } = await props.marketContract.sendAcceptOfferEsdtTransaction(
          props.offer.index,
          paymentAmount.toFixed(),
          props.offer.wanted_token_identifier,
          props.amount,
          address
        );

        // if offer is sold out by this transaction, close Drawer if opened
        if (props.setSessionId && props.amount == props.offer.quantity) {
          props.setSessionId(sessionId);
        }
      } else {
        const { sessionId } = await props.marketContract.sendAcceptOfferNftEsdtTransaction(
          props.offer.index,
          paymentAmount.toFixed(),
          props.offer.wanted_token_identifier,
          props.offer.wanted_token_nonce,
          props.amount,
          address
        );

        // if offer is sold out by this transaction, close Drawer if opened
        if (props.setSessionId && props.amount == props.offer.quantity) {
          props.setSessionId(sessionId);
        }
      }
    }

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
                <Text fontSize="lg">Procure Access to Data NFTs</Text>
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
            <Flex fontSize="md" mt="2">
              <Box w="140px">How many</Box>
              <Box>: {props.amount ? props.amount : 1}</Box>
            </Flex>
            <Flex fontSize="md" mt="2">
              <Box w="140px">Fee per NFT</Box>
              <Box>
                {props.buyerFee ? (
                  <>
                    {": "}
                    {printPrice(
                      convertWeiToEsdt(
                        new BigNumber(props.offer.wanted_token_amount).multipliedBy(10000).div(10000 + props.buyerFee),
                        tokenDecimals(props.offer.wanted_token_identifier)
                      ).toNumber(),
                      getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Box>
            </Flex>
            <Flex>
              {new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).comparedTo(wantedTokenBalance) > 0 && (
                <Text ml="146" color="red.400" fontSize="xs" mt="1 !important">
                  Your wallet token balance is too low to proceed
                </Text>
              )}
            </Flex>
            <Flex fontSize="md" mt="2">
              <Box w="140px">Buyer Tax (per NFT)</Box>
              <Box>
                :{" "}
                {props.buyerFee
                  ? `${props.buyerFee / 100}% (${convertWeiToEsdt(
                      new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.buyerFee).div(10000 + props.buyerFee),
                      tokenDecimals(props.offer.wanted_token_identifier)
                    ).toNumber()} ${getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)})`
                  : "-"}
              </Box>
            </Flex>
            <Flex fontSize="md" mt="2">
              <Box w="140px">Total Fee</Box>
              <Box>
                {": "}
                {props.buyerFee ? (
                  <>
                    {feePrice} {fee && props.itheumPrice ? `(${convertToLocalString(fee * props.itheumPrice, 2)} USD)` : ""}
                  </>
                ) : (
                  "-"
                )}
              </Box>
            </Flex>
            <Flex fontSize="xs" mt="0">
              <Box w="146px"></Box>
              <Box>
                {props.buyerFee ? (
                  <>
                    {new BigNumber(props.offer.wanted_token_amount).comparedTo(0) <= 0 ? (
                      ""
                    ) : (
                      <>
                        {" " +
                          convertWeiToEsdt(
                            new BigNumber(props.offer.wanted_token_amount)
                              .multipliedBy(props.amount)
                              .multipliedBy(10000)
                              .div(10000 + props.buyerFee),
                            tokenDecimals(props.offer.wanted_token_identifier)
                          ).toNumber() +
                          " "}
                        {getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)}
                        {" + "}
                        {convertWeiToEsdt(
                          new BigNumber(props.offer.wanted_token_amount)
                            .multipliedBy(props.amount)
                            .multipliedBy(props.buyerFee)
                            .div(10000 + props.buyerFee),
                          tokenDecimals(props.offer.wanted_token_identifier)
                        ).toNumber()}
                        {" " + getTokenWantedRepresentation(props.offer.wanted_token_identifier, props.offer.wanted_token_nonce)}
                      </>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Box>
            </Flex>
            <Flex mt="4 !important">
              <Button colorScheme="teal" variant="outline" size="sm" onClick={() => window.open('https://itheum.com/legal/datadex/termsofuse')}>
                Read Terms of Use
              </Button>
            </Flex>
            <Checkbox size="sm" mt="3 !important" isChecked={readTermsChecked} onChange={(e: any) => setReadTermsChecked(e.target.checked)}>
              I have read all terms and agree to them
            </Checkbox>
            <Flex justifyContent="end" mt="4 !important">
              <Button
                colorScheme="teal"
                size="sm"
                mx="3"
                onClick={onProcure}
                isDisabled={!readTermsChecked || new BigNumber(props.offer.wanted_token_amount).multipliedBy(props.amount).comparedTo(wantedTokenBalance) > 0}>
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
