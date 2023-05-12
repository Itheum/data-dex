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
import { useMarketStore } from "store";
import ProcureDataNFTModal from "./ProcureDataNFTModal";
import { isValidNumericCharacter } from "../libs/util";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { DataNftMetadataType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type MarketplaceLowerCardProps = {
  offer: OfferType;
  nftMetadata: DataNftMetadataType;
  index: number;
};

const MarketplaceLowerCard: FC<MarketplaceLowerCardProps> = ({ offer, index, nftMetadata }) => {
  const { colorMode } = useColorMode();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;

  const marketRequirements = useMarketStore((state) => state.marketRequirements);

  const [amount, setAmount] = useState<number>(1);
  const [amountError, setAmountError] = useState<string>('');
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const isMyNft = offer.owner === address;

  return (
    <>
      <Button
        my="3"
        size="sm"
        colorScheme="teal"
        variant="outline"
        onClick={() => {
          window.open(nftMetadata.dataPreview);
        }}>
        <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
          Preview Data
        </Text>
      </Button>
      {!isMyNft ? (
        <HStack>
          <Flex flexDirection="row">
            <Box>
              <Text fontSize="md" mb="1">
                Amount{" "}
              </Text>
              <NumberInput
                size="md"
                maxW="24"
                step={1}
                min={1}
                max={offer.quantity}
                isValidCharacter={isValidNumericCharacter}
                value={amount}
                defaultValue={1}
                onChange={(valueAsString) => {
                  const value = Number(valueAsString);
                  let error = "";
                  if (value <= 0) {
                    error = "Cannot be zero or negative";
                  } else if (value > offer.quantity) {
                    error = "Cannot exceed balance";
                  }
                  setAmountError(error);
                  setAmount(value);
                }}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Button
              size="sm"
              colorScheme="teal"
              mt="7"
              ml="4"
              isDisabled={hasPendingTransactions || !!amountError}
              onClick={() => {
                onProcureModalOpen();
              }}>
              Purchase Data
            </Button>
          </Flex>
        </HStack>
      ) : (
        <HStack h="3rem"></HStack>
      )}

      {!!amountError && (
        <Text color="red.400" fontSize="xs" mt={1}>
          {amountError}
        </Text>
      )}

      {nftMetadata && (
        <ProcureDataNFTModal
          isOpen={isProcureModalOpen}
          onClose={onProcureModalClose}
          buyerFee={marketRequirements?.buyer_fee || 0}
          nftData={nftMetadata}
          offer={offer}
          amount={amount}
        />
      )}
    </>
  );
};

export default MarketplaceLowerCard;
