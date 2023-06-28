import React, { FC, useEffect, useState } from "react";
import {
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
  useColorMode,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import ProcureDataNFTModal from "./ProcureDataNFTModalEVM";
import { isValidNumericCharacter } from "../libs/util";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "../MultiversX/typesEVM";
import { useChainMeta } from "../store/ChainMetaContext";

type MarketplaceLowerCardProps = {
  item: ItemType;
  offers: OfferType[];
  nftMetadatas: DataNftMetadataType[];
  index: number;
  itheumPrice: number | undefined;
  marketRequirements: MarketplaceRequirementsType | undefined;
  setMenuItem: any;
};

const MarketplaceLowerCardEVM: FC<MarketplaceLowerCardProps> = ({ item, index, offers, nftMetadatas, itheumPrice, marketRequirements, setMenuItem }) => {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [isMyNft, setIsMyNft] = useState<boolean>(false);

  // useEffect(() => {
  //   (async () => {
  //     // init - no selection
  //     setSelectedOfferIndex(-1);

  //     const amounts: any = {};
  //     const _amountErrors: string[] = [];
  //     for (let i = 0; i < offers.length; i++) {
  //       amounts[i] = 1;
  //       _amountErrors.push("");
  //     }
  //     setAmountOfTokens(amounts);
  //     setAmountErrors(_amountErrors);
  //     if (item.owner === _chainMeta.loggedInAddress) {
  //       setIsMyNft(true);
  //     } else {
  //       setIsMyNft(false);
  //     }
  //   })();
  // }, [hasPendingTransactions]);

  return (
    <>
      {/* <Button
        my="3"
        size="sm"
        colorScheme="teal"
        variant="outline"
        onClick={() => {
          window.open(nftMetadatas[index].dataPreview);
        }}>
        <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
          Preview Data
        </Text>
      </Button> */}
      {!isMyNft && nftMetadatas[index].transferable === 1 ? (
        <HStack>
          <Flex flexDirection="row">
            {/* <Box>
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
            </Box> */}
            <Button
              size="sm"
              colorScheme="teal"
              mt="7"
              // ml="4"
              // isDisabled={hasPendingTransactions || !!amountErrors[index]}
              isDisabled={!!amountErrors[index]}
              onClick={() => {
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
        <Text color="red.400" fontSize="xs" mt={1}>
          {amountErrors[index]}
        </Text>
      )}

      {selectedOfferIndex >= 0 && nftMetadatas.length > selectedOfferIndex && (
        <ProcureDataNFTModal
          isOpen={isProcureModalOpen}
          onClose={onProcureModalClose}
          itheumPrice={itheumPrice || 0}
          marketContract={null}
          buyerFee={marketRequirements?.buyer_fee || 0}
          nftData={nftMetadatas[selectedOfferIndex]}
          offer={offers[selectedOfferIndex]}
          amount={amountOfTokens[selectedOfferIndex]}
          item={item}
          setMenuItem={setMenuItem}
        />
      )}
    </>
  );
};

export default MarketplaceLowerCardEVM;
