import React, { Dispatch, FC, SetStateAction } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, uxConfig } from "libs/config";
import { getApi } from "libs/MultiversX/api";
import { DataNftMetadataType, OfferType } from "libs/MultiversX/types";
import { convertWeiToEsdt, convertToLocalString, getTokenWantedRepresentation, hexZero, tokenDecimals } from "libs/utils";
import { useMarketStore, useMintStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";

type MyListedDataNFTProps = {
  offer: OfferType;
  offers: Record<any, any>;
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading: boolean;
  nftMetadata: DataNftMetadataType[];
  printPrice: (price: number, token: string) => string;
  setDelistAmount: Dispatch<SetStateAction<number>>;
  setDelistModalState: Dispatch<SetStateAction<number>>;
  onDelistModalOpen: () => void;
  setSelectedOfferIndex: Dispatch<SetStateAction<number>>;
  setNewListingPrice: Dispatch<SetStateAction<number>>;
  amountOfTokens: Record<any, any>; //record<string, number> stands for empty object
  onUpdatePriceModalOpen: () => void;
  index: number;
  children?: React.ReactNode;
};

const MyListedDataNFT: FC<MyListedDataNFTProps> = (props) => {
  const {
    offer,
    offers,
    nftImageLoading,
    nftMetadataLoading,
    setNftImageLoading,
    nftMetadata,
    printPrice,
    setDelistAmount,
    setDelistModalState,
    onDelistModalOpen,
    setSelectedOfferIndex,
    setNewListingPrice,
    amountOfTokens,
    onUpdatePriceModalOpen,
    index,
    children,
  } = props;
  const { network } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const userData = useMintStore((state) => state.userData);

  return (
    <Skeleton isLoaded={nftMetadataLoading}>
      <Flex wrap="wrap" gap="5" key={index}>
        <Box maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mb="1rem" position="relative" w="13.5rem">
          <Flex justifyContent="center" pt={5}>
            <Image
              src={`https://${getApi(_chainMeta.networkId)}/nfts/${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}/thumbnail`}
              alt={"item.dataPreview"}
              h={200}
              w={200}
              borderRadius="md"
              onLoad={() => setNftImageLoading(true)}
            />
          </Flex>

          <Flex h="28rem" p="3" direction="column" justify="space-between">
            {!nftMetadataLoading && nftMetadata[index] && (
              <>
                <Text fontSize="xs">
                  <Link href={`${ChainExplorer}/nfts/${nftMetadata[index].id}`} isExternal>
                    {nftMetadata[index].tokenName} <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
                <Popover trigger="hover" placement="auto">
                  <PopoverTrigger>
                    <div>
                      <Text fontWeight="bold" fontSize="lg" mt="2">
                        {nftMetadata[index].title.length > 20 ? nftMetadata[index].title.substring(0, 19) + "..." : nftMetadata[index].title}
                      </Text>

                      <Flex flexGrow="1">
                        <Text fontSize="md" mt="2" color="#929497" noOfLines={[1, 2, 3]} w="100%">
                          {nftMetadata[index].description.length > 54
                            ? nftMetadata[index].description.substring(0, 53) + "..."
                            : nftMetadata[index].description}
                        </Text>
                      </Flex>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent mx="2" width="220px" mt="-7">
                    <PopoverHeader fontWeight="semibold" fontSize="md">
                      {nftMetadata[index].title}
                    </PopoverHeader>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Text fontSize="sm" mt="2" color="gray.200">
                        {nftMetadata[index].description}
                      </Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Flex display="flex" flexDirection="column">
                  <Box color="gray.600" fontSize="sm">
                    Creator:
                    <ShortAddress address={nftMetadata[index].creator} />
                    <Link href={`${ChainExplorer}/accounts/${nftMetadata[index].creator}`} isExternal>
                      <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                  <Box color="gray.600" fontSize="sm">
                    Owner: <ShortAddress address={offer.owner} />
                    <Link href={`${ChainExplorer}/accounts/${offer.owner}`} isExternal>
                      <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                  <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" gap="1" my="1" height="5rem">
                    {address && address == nftMetadata[index].creator && (
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        <Text>You are the Creator</Text>
                      </Badge>
                    )}

                    {address && address == offer.owner && (
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        <Text>You are the Owner</Text>
                      </Badge>
                    )}

                    <Badge borderRadius="full" px="2" colorScheme="blue">
                      Fully Transferable License
                    </Badge>
                  </Box>
                </Flex>

                <Box display="flex" justifyContent="flex-start" mt="2">
                  <Text fontSize="xs">{`Creation time:   ${moment(nftMetadata[index].creationTime).format(uxConfig.dateStr)}`}aaaa</Text>
                </Box>

                <Box color="gray.600" fontSize="sm">
                  {`Balance: ${offer.quantity} out of ${nftMetadata[index].supply}. Royalty: ${convertToLocalString(nftMetadata[index].royalties * 100)}%`}
                </Box>
              </>
            )}

            {!nftMetadataLoading && !!nftMetadata[index] && (
              <>
                <Box fontSize="xs" mt="2">
                  <Text>
                    Unlock from: {` `}
                    {printPrice(
                      convertWeiToEsdt(offer.wanted_token_amount, tokenDecimals(offer.wanted_token_identifier)).toNumber(),
                      getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                    )}
                  </Text>
                </Box>

                <Tooltip colorScheme="teal" hasArrow label="Preview Data is disabled on devnet" isDisabled={network.id != "devnet"}>
                  <Button
                    mt="2"
                    size="sm"
                    colorScheme="teal"
                    height="7"
                    variant="outline"
                    isDisabled={network.id == "devnet"}
                    onClick={() => {
                      window.open(nftMetadata[index].dataPreview);
                    }}>
                    Preview Data
                  </Button>
                </Tooltip>

                {address && (
                  <>
                    <Flex mt="2" gap="2">
                      <Button
                        size="xs"
                        colorScheme="teal"
                        width="72px"
                        isDisabled={hasPendingTransactions}
                        onClick={() => {
                          setSelectedOfferIndex(index);
                          setDelistAmount(offers[index].quantity);
                          setDelistModalState(1);
                          onDelistModalOpen();
                        }}>
                        De-List All
                      </Button>
                      {offers[index].quantity > 1 && (
                        <Button
                          size="xs"
                          colorScheme="teal"
                          width="72px"
                          isDisabled={hasPendingTransactions}
                          onClick={() => {
                            setSelectedOfferIndex(index);
                            setDelistAmount(1);
                            setDelistModalState(0);
                            onDelistModalOpen();
                          }}>
                          De-List Some
                        </Button>
                      )}
                      <Button
                        size="xs"
                        colorScheme="teal"
                        width="72px"
                        isDisabled={hasPendingTransactions}
                        onClick={() => {
                          setSelectedOfferIndex(index);
                          if (marketRequirements) {
                            setNewListingPrice(
                              convertWeiToEsdt(
                                new BigNumber(offers[index].wanted_token_amount)
                                  .multipliedBy(amountOfTokens[index])
                                  .multipliedBy(10000)
                                  .div(10000 + marketRequirements.buyer_fee),
                                tokenDecimals(offers[index].wanted_token_identifier)
                              ).toNumber()
                            );
                          } else {
                            setNewListingPrice(0);
                          }
                          onUpdatePriceModalOpen();
                        }}>
                        Update Fee
                      </Button>
                    </Flex>
                  </>
                )}
              </>
            )}
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
            visibility={
              userData && (userData?.addressFrozen || (userData?.frozenNonces && userData?.frozenNonces.includes(offer?.offered_token_nonce)))
                ? "visible"
                : "collapse"
            }>
            <Box fontSize="24px" fontWeight="500" lineHeight="38px" position="absolute" top="45%" textAlign="center" textColor="teal.200" px="2">
              - FROZEN -{" "}
              <Text fontSize="16px" fontWeight="400" textColor="white" lineHeight="25px" px={3}>
                Data NFT is under investigation by the DAO as there was a complaint received against it
              </Text>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Skeleton>
  );
};

export default MyListedDataNFT;
