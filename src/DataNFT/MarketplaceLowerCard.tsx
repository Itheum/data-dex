import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Flex,
  Box,
  Image,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import ProcureDataNFTModal from "./ProcureDataNFTModal";
import { convertWeiToEsdt, isValidNumericCharacter, sleep } from "../libs/util";
import { printPrice } from "../libs/util2";
import { getAccountTokenFromApi } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { tokenDecimals, getTokenWantedRepresentation } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type MarketplaceLowerCardProps = {
  item: ItemType;
  offers: OfferType[];
  nftMetadatas: DataNftMetadataType[];
  index: number;
  itheumPrice: number | undefined;
  marketRequirements: MarketplaceRequirementsType | undefined;
};

const MarketplaceLowerCard: FC<MarketplaceLowerCardProps> = ({ item, index, offers, nftMetadatas, itheumPrice, marketRequirements }) => {
  const { colorMode } = useColorMode();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [feePrice, setFeePrice] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const contract = new DataNftMarketContract(_chainMeta.networkId);
  const [isMyNft, setIsMyNft] = useState<boolean>(false);
  const toast = useToast();
  const { address } = useGetAccountInfo();

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);

      const amounts: any = {};
      const _amountErrors: string[] = [];
      for (let i = 0; i < offers.length; i++) {
        amounts[i] = 1;
        _amountErrors.push("");
      }
      setAmountOfTokens(amounts);
      setAmountErrors(_amountErrors);
      if (item.owner === address) {
        setIsMyNft(true);
      } else {
        setIsMyNft(false);
      }
    })();
  }, [hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      if (!(address && selectedOfferIndex >= 0 && selectedOfferIndex < offers.length)) return;

      // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
      const _token = await getAccountTokenFromApi(address, offers[selectedOfferIndex].wanted_token_identifier, _chainMeta.networkId);
      if (_token) {
        setWantedTokenBalance(_token.balance ? _token.balance : "0");
      } else {
        setWantedTokenBalance("0");
      }
    })();
  }, [address, offers, selectedOfferIndex, hasPendingTransactions]);

  useEffect(() => {
    setFeePrice(
      printPrice(
        convertWeiToEsdt(item?.wanted_token_amount, tokenDecimals(item?.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(item?.wanted_token_identifier, item?.wanted_token_nonce)
      )
    );
    setFee(convertWeiToEsdt(item?.wanted_token_amount, tokenDecimals(item?.wanted_token_identifier)).toNumber());
  }, []);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!marketRequirements) {
      toast({
        title: "Data is not loaded",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
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
    const offer = offers[selectedOfferIndex];
    const paymentAmount = new BigNumber(offer.wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]);
    if (offer.wanted_token_identifier == "EGLD") {
      contract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amountOfTokens[selectedOfferIndex], address);
    } else {
      if (offer.wanted_token_nonce === 0) {
        contract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          amountOfTokens[selectedOfferIndex],
          address
        );
      } else {
        contract.sendAcceptOfferNftEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          offer.wanted_token_nonce,
          amountOfTokens[selectedOfferIndex],
          address
        );
      }
    }
    // a small delay for visual effect
    await sleep(0.5);
    onProcureModalClose();
  };

  return (
    <>
      <Button
        mt="3"
        mb="3"
        size="sm"
        colorScheme="teal"
        variant="outline"
        onClick={() => {
          window.open(nftMetadatas[index].dataPreview);
        }}>
        <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
          Preview Data
        </Text>
      </Button>
      {!isMyNft ? (
        <HStack>
          <Flex flexDirection="column">
            <Text fontSize="md" mb="1">
              Amount{" "}
            </Text>
            <NumberInput
              size="md"
              maxW="24"
              step={1}
              min={1}
              max={item?.quantity}
              isValidCharacter={isValidNumericCharacter}
              value={amountOfTokens[index]}
              defaultValue={1}
              onChange={(valueAsString) => {
                const value = Number(valueAsString);
                let error = "";
                if (value <= 0) {
                  error = "Cannot be zero or negative";
                } else if (value > item?.quantity) {
                  error = "Cannot exceed balance";
                }
                setAmountErrors((oldErrors: any) => {
                  const newErrors = [...oldErrors];
                  newErrors[index] = error;
                  return newErrors;
                });
                setAmountOfTokens((oldAmounts: any) => {
                  const newAmounts = { ...oldAmounts };
                  newAmounts[index] = value;
                  return newAmounts;
                });
              }}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              size="sm"
              colorScheme="teal"
              my={3}
              isDisabled={hasPendingTransactions || !!amountErrors[index]}
              onClick={() => {
                setReadTermsChecked(false);
                setSelectedOfferIndex(index);
                onProcureModalOpen();
              }}>
              Purchase Data
            </Button>
          </Flex>
        </HStack>
      ) : (
        <HStack h="3rem"></HStack>
      )}
      {amountErrors[index] && (
        <Text color="red.400" fontSize="xs">
          {amountErrors[index]}
        </Text>
      )}

      {selectedOfferIndex >= 0 && nftMetadatas.length > selectedOfferIndex && (
        <ProcureDataNFTModal
          isOpen={isProcureModalOpen}
          onClose={onProcureModalClose}
          itheumPrice={itheumPrice || 0}
          marketContract={contract}
          buyerFee={marketRequirements?.buyer_fee || 0}
          nftData={nftMetadatas[selectedOfferIndex]}
          offer={offers[selectedOfferIndex]}
          amount={amountOfTokens[selectedOfferIndex]}
        />
      )}
    </>
  );
};

export default MarketplaceLowerCard;
