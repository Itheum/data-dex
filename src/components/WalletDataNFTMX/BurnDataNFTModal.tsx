import React, { useState } from "react";
import { Button } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { Image } from "@chakra-ui/image";
import { Stack, HStack, Text, Box, Flex } from "@chakra-ui/layout";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody } from "@chakra-ui/modal";
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/number-input";
import { useToast } from "@chakra-ui/toast";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { contractsForChain } from "libs/config";
import { labels } from "libs/language";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { DataNftType } from "libs/MultiversX/types";
import { isValidNumericCharacter } from "libs/utils";

type BurnDataNFTModalPropType = {
  isOpen: boolean;
  onClose: () => void;
  selectedDataNft: DataNftType;
};

export default function BurnDataNFTModal(props: BurnDataNFTModalPropType) {
  const { isOpen, onClose, selectedDataNft } = props;
  const { chainID } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const mintContract = new DataNftMintContract(chainID);
  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(selectedDataNft.balance);
  const toast = useToast();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();

  const onChangeDataNftBurnAmount = (valueAsString: string) => {
    let error = "";
    const valueAsNumber = Number(valueAsString);
    if (valueAsNumber < 1) {
      error = "Burn amount cannot be zero or negative";
    } else if (selectedDataNft && valueAsNumber > Number(selectedDataNft.balance)) {
      error = "Data NFT balance exceeded";
    }

    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(valueAsNumber);
  };

  const showErrorToast = (title: string) => {
    toast({
      title,
      status: "error",
      isClosable: true,
    });
  };

  const onBurn = () => {
    const errorMessages = {
      noWalletConn: labels.ERR_BURN_NO_WALLET_CONN,
      noNFTSelected: labels.ERR_BURN_NO_NFT_SELECTED,
    };

    const conditions = [
      {
        condition: !address,
        errorMessage: errorMessages.noWalletConn,
      },
      {
        condition: !selectedDataNft,
        errorMessage: errorMessages.noNFTSelected,
      },
    ];

    const shouldReturn = conditions.some(({ condition, errorMessage }) => {
      if (condition) {
        showErrorToast(errorMessage);
        return true;
      }
      return false;
    });

    if (shouldReturn || !selectedDataNft) {
      return;
    }

    mintContract.sendBurnTransaction(
      address,
      selectedDataNft.collection,
      selectedDataNft.nonce,
      dataNftBurnAmount,
      contractsForChain(chainID).dataNftTokens.find((t) => t.id === selectedDataNft.collection)?.contract
    );

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        {burnNFTModalState === 1 ? (
          <>
            <ModalHeader>Burn Supply from my Data NFT</ModalHeader>
            <ModalBody pb={6}>
              <HStack spacing="5" alignItems="center">
                <Box flex="1.1">
                  <Stack>
                    <Image src={selectedDataNft.nftImgUrl} h={100} w={100} borderRadius="md" m="auto" />
                    <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" textAlign="center">
                      {selectedDataNft.tokenName}
                    </Text>
                  </Stack>
                </Box>
                <Box flex="1.9" alignContent="center">
                  <Text color="orange.300" fontSize="sm">
                    You have ownership of {selectedDataNft.balance} Data NFTs (out of a total of {selectedDataNft.supply}). You can burn these{" "}
                    {selectedDataNft.balance} Data NFTs and remove them from your wallet.
                    {selectedDataNft.supply - selectedDataNft.balance > 0 &&
                      ` The remaining ${selectedDataNft.supply - selectedDataNft.balance} ${
                        selectedDataNft.supply - selectedDataNft.balance > 1 ? "are" : "is"
                      } not under your ownership.`}
                  </Text>
                </Box>
              </HStack>

              <Text fontSize="md" mt="4">
                Please note that Data NFTs not listed in the Data NFT marketplace are &quot;NOT public&quot; and are &quot;Private&quot; to only you so no one
                can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not be able to
                recover them again.
              </Text>

              <HStack mt="8">
                <Text fontSize="md">How many do you want to burn?</Text>
                <NumberInput
                  ml="3px"
                  size="sm"
                  maxW="24"
                  step={1}
                  defaultValue={selectedDataNft.balance}
                  min={1}
                  max={selectedDataNft.balance}
                  isValidCharacter={isValidNumericCharacter}
                  value={dataNftBurnAmount}
                  onChange={onChangeDataNftBurnAmount}
                  keepWithinRange={true}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
              {dataNftBurnAmountError && (
                <Text ml="215px" color="red.400" fontSize="xs" mt="1 !important">
                  {dataNftBurnAmountError}
                </Text>
              )}

              <Flex justifyContent="end" mt="8 !important">
                <Button
                  colorScheme="teal"
                  size="sm"
                  mx="3"
                  onClick={() => setBurnNFTModalState(2)}
                  isDisabled={!!dataNftBurnAmountError || hasPendingTransactions}>
                  I want to Burn my {dataNftBurnAmount} Data NFTs
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </Flex>
            </ModalBody>
          </>
        ) : (
          <>
            <ModalHeader>Are you sure?</ModalHeader>
            <ModalBody pb={6}>
              <Flex>
                <Text fontWeight="bold" fontSize="md" px="1">
                  Data NFT Title: &nbsp;
                </Text>
                <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1">
                  {selectedDataNft.title}
                </Text>
              </Flex>
              <Flex mt="1">
                <Text fontWeight="bold" fontSize="md" px="1">
                  Burn Amount: &nbsp;&nbsp;
                </Text>
                <Text fontSize="sm" backgroundColor="blackAlpha.300" px="1">
                  {dataNftBurnAmount}
                </Text>
              </Flex>
              <Text fontSize="md" mt="2">
                Are you sure you want to proceed with burning the Data NFTs? You cannot undo this action.
              </Text>
              <Flex justifyContent="end" mt="6 !important">
                <Button colorScheme="teal" size="sm" mx="3" onClick={onBurn} isDisabled={hasPendingTransactions}>
                  Proceed
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </Flex>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
