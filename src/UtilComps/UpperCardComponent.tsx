import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, isValidNumericCharacter } from "../libs/util";
import { printPrice } from "../libs/util2";
import { getApi } from "../MultiversX/api";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { DataNftMintContract } from "../MultiversX/dataNftMint";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading?: boolean;
  nftMetadatas: DataNftMetadataType[];
  userData: Record<any, any>;
  item: ItemType;
  index: number;
  children?: React.ReactNode;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const {
    nftImageLoading,
    nftMetadataLoading,
    setNftImageLoading,
    nftMetadatas,
    userData,
    index,
    children,
    item,
  } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const { hasPendingTransactions } = useGetPendingTransactions();
  const mintContract = new DataNftMintContract(_chainMeta.networkId);

  const [feePrice, setFeePrice] = useState<string>("");

  const [selectedDataNft, setSelectedDataNft] = useState<ItemType | undefined>();
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const toast = useToast();


  const onChangeDataNftBurnAmount = (valueAsString: string) => {
    let error = "";
    const valueAsNumber = Number(valueAsString);
    console.log("valueAsNumber", valueAsNumber);
    console.log("selectedDataNft", selectedDataNft);
    if (valueAsNumber < 1) {
      error = "Burn Amount cannot be zero or negative";
    } else if (selectedDataNft && valueAsNumber > Number(selectedDataNft.balance)) {
      error = "Data NFT balance exceeded";
    }
    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(valueAsNumber);
  };
  const onBurnButtonClick = (nft: ItemType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance)); // init
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  const onBurn = () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!selectedDataNft) {
      toast({
        title: "No NFT is selected",
        status: "error",
        isClosable: true,
      });
      return;
    }

    mintContract.sendBurnTransaction(address, selectedDataNft.collection, selectedDataNft.nonce, dataNftBurnAmount);

    // close modal
    onBurnNFTClose();
  };

  useEffect(() => {
  //   setFeePrice(
  //     printPrice(
  //       convertWeiToEsdt(item?.wanted_token_amount as BigNumber.Value, tokenDecimals(item?.wanted_token_identifier)).toNumber(),
  //       getTokenWantedRepresentation(item?.wanted_token_identifier, item?.wanted_token_nonce)
  //     )
  //   );
  }, []);

  return (
    <Flex wrap="wrap" gap="5" key={index}>
      <Box maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mb="1rem" position="relative" w="13.5rem">
        <Flex justifyContent="center" pt={5}>
          <Skeleton isLoaded={nftImageLoading} h={200}>
            {item?.offered_token_identifier ?
            <Image
              src={`https://${getApi("ED")}/nfts/${item?.offered_token_identifier}-${hexZero(item?.offered_token_nonce)}/thumbnail`}
              alt={"item.dataPreview"}
              h={200}
              w={200}
              borderRadius="md"
              onLoad={() => setNftImageLoading(true)}
            />
              :
            <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setNftImageLoading(true)} />
            }
            </Skeleton>
        </Flex>

        <Flex h="28rem" p="3" direction="column" justify="space-between">
          {nftMetadataLoading && <Skeleton />}
          {!nftMetadataLoading && nftMetadatas[index] && (
            <>
              <Text fontSize="xs">
                <Link href={`${ChainExplorer}/nfts/${nftMetadatas[index].id}`} isExternal>
                  {nftMetadatas[index].tokenName} <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Popover trigger="hover" placement="auto">
                <PopoverTrigger>
                  <div>
                    <Text fontWeight="bold" fontSize="lg" mt="2">
                      {nftMetadatas[index].title.length > 20 ? nftMetadatas[index].title.substring(0, 19) + "..." : nftMetadatas[index].title}
                    </Text>

                    <Flex flexGrow="1">
                      <Text fontSize="md" mt="2" color="#929497" noOfLines={2} w="100%" h="10">
                        {nftMetadatas[index].description}
                      </Text>
                    </Flex>
                  </div>
                </PopoverTrigger>
                <PopoverContent mx="2" width="220px" mt="-7">
                  <PopoverHeader fontWeight="semibold">{nftMetadatas[index].title}</PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Text fontSize="sm" mt="2" color="gray.200">
                      {nftMetadatas[index].description}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

            </>
          )}
          {address && <>{children}</>}
        </Flex>

        <Box
          position="absolute"
          top="0"
          bottom="0"
          left="0"
          right="0"
          height="100%"
          width="100%"
          backgroundColor="blackAlpha.800"
          rounded="lg"
          visibility={userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(item?.offered_token_nonce)) ? "visible" : "collapse"}>
          <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2">
            - FROZEN - <br />
            Data NFT is under investigation by the DAO as there was a complaint received against it
          </Text>
        </Box>
      </Box>

      {selectedDataNft && (
        <Modal isOpen={isBurnNFTOpen} onClose={onBurnNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            {burnNFTModalState === 1 ? (
              <>
                <ModalHeader>Burn Supply from my Data NFT</ModalHeader>
                <ModalBody pb={6}>
                  <HStack spacing="5" alignItems="center">
                    <Box flex="1.1">
                      <Stack>
                        <Image src={selectedDataNft.nftImgUrl} h={100} w={100} borderRadius="md" m="auto" />
                        <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                          {selectedDataNft.tokenName}
                        </Text>
                      </Stack>
                    </Box>
                    <Box flex="1.9" alignContent="center">
                      <Text color="orange.300" fontSize="sm">
                        You have ownership of {selectedDataNft.balance} Data NFTs (out of a total of {selectedDataNft.supply}). You can burn these{" "}
                        {selectedDataNft.balance} Data NFTs and remove them from your wallet.
                        {selectedDataNft.supply - selectedDataNft.balance > 0 &&
                          ` The remaining ${selectedDataNft.supply - selectedDataNft.balance} are not under your ownership.`}
                      </Text>
                    </Box>
                  </HStack>

                  <Text fontSize="md" mt="4">
                    Please note that Data NFTs not listed in the Data NFT marketplace are &quot;NOT public&quot; and are &quot;Private&quot; to only you so on
                    one can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not be
                    able to recover them again.
                  </Text>

                  <HStack mt="8">
                    <Text fontSize="md">How many do you want to burn?</Text>
                    <NumberInput
                      size="xs"
                      maxW={16}
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
                    <Text ml="208px" color="red.400" fontSize="sm" mt="1 !important">
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
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
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
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
                      Cancel
                    </Button>
                  </Flex>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

    </Flex>
  );
};

export default UpperCardComponent;
