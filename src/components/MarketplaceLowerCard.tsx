import React, { FC, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import ProcureDataNFTModal from "components/ProcureDataNFTModal";
import ExploreAppButton from "components/UtilComps/ExploreAppButton";
import { DataNftMetadataType } from "libs/MultiversX/types";
import { ExtendedOffer } from "libs/types";
import { isValidNumericCharacter } from "libs/utils";
import { useMarketStore } from "store";
import { LivelinessScore } from "./Liveliness/LivelinessScore";
import PreviewDataButton from "./PreviewDataButton";

type MarketplaceLowerCardProps = {
  extendedOffer: ExtendedOffer;
  nftMetadata: DataNftMetadataType;
  index: number;
};

const MarketplaceLowerCard: FC<MarketplaceLowerCardProps> = ({ extendedOffer: offer, nftMetadata, index }) => {
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const [amount, setAmount] = useState<number>(1);
  const [amountError, setAmountError] = useState<string>("");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const isMyNft = offer.owner === address;
  const maxBuyLimit = import.meta.env.VITE_MAX_BUY_LIMIT_PER_SFT ? Number(import.meta.env.VITE_MAX_BUY_LIMIT_PER_SFT) : 0;
  const maxBuyNumber = maxBuyLimit > 0 ? Math.min(maxBuyLimit, offer.quantity) : offer.quantity;

  // console.log(offer);

  return (
    <>
      <HStack justifyContent="stretch" pb={2}>
        <PreviewDataButton previewDataURL={nftMetadata.dataPreview} />

        <ExploreAppButton nonce={offer.offeredTokenNonce} />
      </HStack>

      {import.meta.env.VITE_ENV_NETWORK === "devnet" && <LivelinessScore unboundTimestamp={offer.unboundTimestamp} lockPeriod={offer.lockPeriod} />}
      {!isMyNft ? (
        isMxLoggedIn && (
          <HStack mt={2} flexDirection="column">
            <Flex flexDirection="row">
              <Box>
                <Text fontSize="md" mb="1">
                  Quantity{" "}
                </Text>
                <NumberInput
                  size="md"
                  maxW="24"
                  step={1}
                  min={1}
                  max={maxBuyNumber}
                  isValidCharacter={isValidNumericCharacter}
                  value={amount}
                  defaultValue={1}
                  onChange={(valueAsString) => {
                    const value = Number(valueAsString);
                    let error = "";
                    if (value <= 0) {
                      error = "Cannot be zero or negative";
                    } else if (value > offer.quantity) {
                      error = "Cannot exceed listed amount";
                    } else if (maxBuyLimit > 0 && value > maxBuyLimit) {
                      error = "Cannot exceed max buy limit";
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
                Buy Data NFT
              </Button>
            </Flex>
          </HStack>
        )
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
          buyerFee={marketRequirements.buyerTaxPercentage || 0}
          nftData={nftMetadata}
          offer={offer}
          amount={amount}
        />
      )}
    </>
  );
};

export default MarketplaceLowerCard;
