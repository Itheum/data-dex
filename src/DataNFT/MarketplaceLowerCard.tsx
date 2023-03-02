import React, { FC, useState } from "react";
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
} from "@chakra-ui/react";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { isValidNumericCharacter } from "../libs/util";
import { OfferType } from "../MultiversX/types";

type MarketplaceLowerCardProps = {
  offer: OfferType;
  index: number;
};

const MarketplaceLowerCard: FC<MarketplaceLowerCardProps> = (props) => {
  const { offer, index } = props;

  const { hasPendingTransactions } = useGetPendingTransactions();
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();

  return (
    <>
      <HStack h="3rem">
        <Text fontSize="xs">How many to procure </Text>
        <NumberInput
          size="xs"
          maxW={16}
          step={1}
          min={1}
          max={offer.quantity}
          isValidCharacter={isValidNumericCharacter}
          value={amountOfTokens[index]}
          onChange={(valueAsString) => {
            const value = Number(valueAsString);
            let error = "";
            if (value <= 0) {
              error = "Cannot be zero or negative";
            } else if (value > offer.quantity) {
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
          size="xs"
          colorScheme="teal"
          width="72px"
          isDisabled={hasPendingTransactions || !!amountErrors[index]}
          onClick={() => {
            setReadTermsChecked(false);
            setSelectedOfferIndex(index);
            onProcureModalOpen();
          }}>
          Procure
        </Button>
      </HStack>
      {amountErrors[index] && (
        <Text color="red.400" fontSize="xs">
          {amountErrors[index]}
        </Text>
      )}
    </>
  );
};

export default MarketplaceLowerCard;
