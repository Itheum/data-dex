import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
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
import moment from "moment/moment";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "../libs/util";
import { printPrice } from "../libs/util2";
import { getApi } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, MarketplaceRequirementsType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type UpperCardComponentProps = {
  offer: OfferType;
  offers: Record<any, any>;
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading: boolean;
  nftMetadata: DataNftMetadataType[];
  userData: Record<any, any>;
  index: number;
  children?: React.ReactNode;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const { offer, offers, nftImageLoading, nftMetadataLoading, setNftImageLoading, nftMetadata, userData, index, children } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const { hasPendingTransactions } = useGetPendingTransactions();
  const contract = new DataNftMarketContract("ED");
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});

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
                  Creator: {` ${nftMetadata[index].creator.slice(0, 8)} ... ${nftMetadata[index].creator.slice(-8)}`}
                  <Link href={`${ChainExplorer}/accounts/${nftMetadata[index].creator}`} isExternal>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box color="gray.600" fontSize="sm">
                  Owner:&nbsp; {` ${offer.owner.slice(0, 8)} ... ${offer.owner.slice(-8)}`}
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

              {address && <>{children}</>}
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

export default UpperCardComponent;
