import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
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
import moment from "moment/moment";
import { useLocation, useParams } from "react-router-dom";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "../libs/util";
import { printPrice, convertToLocalString } from "../libs/util2";
import { getApi } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import {
  DataNftMetadataType,
  DataNftType,
  ItemType,
  MarketplaceRequirementsType,
  OfferType,
} from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading: boolean;
  nftMetadatas: DataNftMetadataType[];
  userData: Record<any, any>;
  marketRequirements: MarketplaceRequirementsType | undefined;
  item?: ItemType;
  index: number;
  children?: React.ReactNode;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const { nftImageLoading, nftMetadataLoading, setNftImageLoading, nftMetadatas, userData, index, children, item, marketRequirements } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const { hasPendingTransactions } = useGetPendingTransactions();


  const location = useLocation();
  const [feePrice, setFeePrice] = useState<string>("");

  const contract = new DataNftMarketContract("ED");
  const [selectedDataNft, setSelectedDataNft] = useState<DataNftType | undefined>();
  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();

  const onBurnButtonClick = (nft: DataNftType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance)); // init
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  useEffect(() => {
    setFeePrice(
      printPrice(
        convertWeiToEsdt(item?.wanted_token_amount, tokenDecimals(item?.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(item?.wanted_token_identifier, item?.wanted_token_nonce)
      )
    );
  }, []);

  return (
    <Flex wrap="wrap" gap="5" key={index}>
      <Box maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mb="1rem" position="relative" w="13.5rem">
        <Flex justifyContent="center" pt={5}>
          <Skeleton isLoaded={nftImageLoading} h={200}>
            <Image
              src={`https://${getApi("ED")}/nfts/${item?.offered_token_identifier}-${hexZero(item?.offered_token_nonce)}/thumbnail`}
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
              <Flex display="flex" flexDirection="column">
                <Box color="gray.600" fontSize="sm">
                  Creator: {` ${nftMetadatas[index].creator.slice(0, 8)} ... ${nftMetadatas[index].creator.slice(-8)}`}
                  <Link href={`${ChainExplorer}/accounts/${nftMetadatas[index].creator}`} isExternal>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box color="gray.600" fontSize="sm">
                  Owner:&nbsp; {` ${item?.owner.slice(0, 8)} ... ${item?.owner.slice(-8)}`}
                  <Link href={`${ChainExplorer}/accounts/${item?.owner}`} isExternal>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" gap="1" my="1" height="5rem">
                  {address && address == nftMetadatas[index].creator && (
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      <Text>You are the Creator</Text>
                    </Badge>
                  )}

                  {address && address == item?.owner && (
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      <Text>You are the Owner</Text>
                    </Badge>
                  )}

                  <Badge borderRadius="full" px="2" colorScheme="blue">
                    Fully Transferable License
                  </Badge>

                  {/*{item && (*/}
                  {/*  <Button mt="2" size="sm" colorScheme="red" height="5" isDisabled={hasPendingTransactions}>*/}
                  {/*    Burn*/}
                  {/*  </Button>*/}
                  {/*)}*/}
                </Box>
              </Flex>

              <Box display="flex" justifyContent="flex-start" mt="2">
                <Text fontSize="xs">{`Creation time:   ${moment(nftMetadatas[index].creationTime).format(uxConfig.dateStr)}`}</Text>
              </Box>

              {nftMetadatas[index] && (
                <Box color="gray.600" fontSize="sm">
                  {`Listed: ${item?.quantity}`} <br />
                  {`Total supply: ${nftMetadatas[index]?.supply}`} <br />
                  {`Royalty: ${convertToLocalString(nftMetadatas[index]?.royalties * 100)}%`}
                </Box>
              )}
            </>
          )}
          {!nftMetadataLoading && !!nftMetadatas[index] && feePrice && (
            <>
              <Box fontSize="xs" mt="2">
                <Text>
                  Fee per NFT: {` `}
                  {marketRequirements ? <>{feePrice}</> : " -"}
                </Text>
              </Box>
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
    </Flex>
  );
};

export default UpperCardComponent;
