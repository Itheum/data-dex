import React, { Dispatch, FC, SetStateAction, useState } from "react";
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
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { ShortAddress } from "UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "../libs/util";
import { getApi } from "../MultiversX/api";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, MarketplaceRequirementsType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";
import { Address } from "@multiversx/sdk-core/out";

type MyListedDataNFTProps = {
  offer: OfferType;
  offers: Record<any, any>;
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading: boolean;
  nftMetadata: DataNftMetadataType[];
  marketRequirements: MarketplaceRequirementsType | undefined;
  printPrice: (price: number, token: string) => string;
  setDelistAmount: Dispatch<SetStateAction<number>>;
  setDelistModalState: Dispatch<SetStateAction<number>>;
  onDelistModalOpen: () => void;
  setSelectedOfferIndex: Dispatch<SetStateAction<number>>;
  setNewListingPrice: Dispatch<SetStateAction<number>>;
  amountOfTokens: Record<any, any>; //record<string, number> stands for empty object
  onUpdatePriceModalOpen: () => void;
  userData: Record<any, any>;
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
    marketRequirements,
    printPrice,
    setDelistAmount,
    setDelistModalState,
    onDelistModalOpen,
    setSelectedOfferIndex,
    setNewListingPrice,
    amountOfTokens,
    onUpdatePriceModalOpen,
    userData,
    index,
    children,
  } = props;
  // Multiversx API
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  return (
    <Flex wrap="wrap" gap="5" key={index}>
      <Box maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mb="1rem" position="relative" w="13.5rem">
        <Flex justifyContent="center" pt={5}>
          <Skeleton isLoaded={nftImageLoading} h={200}>
            <Image
              src={`https://${getApi("ED")}/nfts/${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}/thumbnail`}
              alt={"item.dataPreview"}
              h={200}
              w={200}
              borderRadius="md"
              onLoad={() => setNftImageLoading(true)}
            />
          </Skeleton>
        </Flex>

        <Flex h="28rem" p="3" direction="column" justify="space-between">
          {nftMetadataLoading && <Skeleton />}
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
                        {nftMetadata[index].description.length > 54 ? nftMetadata[index].description.substring(0, 53) + "..." : nftMetadata[index].description}
                      </Text>
                    </Flex>
                  </div>
                </PopoverTrigger>
                <PopoverContent mx="2" width="220px" mt="-7">
                  <PopoverHeader fontWeight="semibold">{nftMetadata[index].title}</PopoverHeader>
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
                  <ShortAddress address={new Address(nftMetadata[index]?.creator)} />
                  <Link href={`${ChainExplorer}/accounts/${nftMetadata[index]?.creator}`} isExternal>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box color="gray.600" fontSize="sm">
                  Owner: <ShortAddress address={new Address(offer.owner)} />
                  <Link href={`${ChainExplorer}/accounts/${new Address(offer.owner)}`} isExternal>
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
                {`Balance: ${offer.quantity} out of ${nftMetadata[index].supply}. Royalty: ${nftMetadata[index].royalties * 100}%`}
              </Box>
            </>
          )}

          {!nftMetadataLoading && !!nftMetadata[index] && (
            <>
              <Box fontSize="xs" mt="2">
                <Text>
                  Fee per NFT: {` `}
                  {marketRequirements ? (
                    <>
                      {printPrice(
                        convertWeiToEsdt(offer.wanted_token_amount, tokenDecimals(offer.wanted_token_identifier)).toNumber(),
                        getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                      )}
                    </>
                  ) : (
                    " -"
                  )}
                </Text>
              </Box>
              <Button
                mt="2"
                size="sm"
                colorScheme="teal"
                height="7"
                variant="outline"
                onClick={() => {
                  console.log("NftLoading", nftMetadataLoading);
                  console.log("nftMetaIndex", !!nftMetadata[index]);
                  window.open(nftMetadata[index].dataPreview);
                }}>
                Preview Data
              </Button>

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
                              BigNumber(offers[index].wanted_token_amount)
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
                      Update Price
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
          visibility={userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(offer.offered_token_nonce)) ? "visible" : "collapse"}>
          <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2">
            - FROZEN - <br />
            Data NFT is under investigation by the DAO as there was a complaint received against it
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default MyListedDataNFT;
