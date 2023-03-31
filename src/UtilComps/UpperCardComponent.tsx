import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import ShortAddress from "./ShortAddress";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "../libs/util";
import { convertToLocalString, printPrice } from "../libs/util2";
import { getApi } from "../MultiversX/api";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  nftMetadatas: DataNftMetadataType[];
  userData: Record<any, any>;
  marketRequirements: MarketplaceRequirementsType | undefined;
  item?: ItemType;
  index: number;
  marketFreezedNonces: number[];
  children?: React.ReactNode;
  openNftDetailsDrawer?: (e: number) => void;
  itheumPrice: number | undefined;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const {
    nftImageLoading,
    setNftImageLoaded,
    nftMetadatas,
    userData,
    index,
    children,
    item,
    marketRequirements,
    marketFreezedNonces,
    openNftDetailsDrawer,
    itheumPrice,
  } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const [feePrice, setFeePrice] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  // Regex for check if description have link
  const regex = /(?:^|[\s\n])(?:\((.*?)\))?((?:https?:\/\/|www\.)[^\s\n]+)/g;

  useEffect(() => {
    setFeePrice(
      printPrice(
        convertWeiToEsdt(item?.wanted_token_amount as BigNumber.Value, tokenDecimals(item?.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(item?.wanted_token_identifier, item?.wanted_token_nonce)
      )
    );
    setFee(convertWeiToEsdt(item?.wanted_token_amount as BigNumber.Value, tokenDecimals(item?.wanted_token_identifier)).toNumber());
  }, []);

  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box maxW="230px" borderWidth="1px" borderRadius="lg" position="relative">
        <Flex justifyContent="center" pt={3}>
          <Image
            src={`https://${getApi(_chainMeta.networkId)}/nfts/${item?.offered_token_identifier}-${hexZero(item?.offered_token_nonce)}/thumbnail`}
            alt={"item.dataPreview"}
            h={200}
            w={200}
            mx={4}
            borderRadius="md"
            cursor="pointer"
            onLoad={() => setNftImageLoaded(true)}
            onClick={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
        </Flex>

        <Flex h="28rem" p="3" direction="column" justify="space-between">
          {nftMetadatas[index] && (
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
                        {nftMetadatas[index].description.replace(regex, " ")}
                        {nftMetadatas[index].description
                          .toString()
                          .split(regex)
                          .map((word, i) => {
                            if (word?.match(regex)) {
                              return (
                                <Link key={i} href={word} isExternal color={"blue.300"}>
                                  {word}
                                </Link>
                              );
                            }
                          })}
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
                      {nftMetadatas[index].description.replace(regex, " ")}
                      {nftMetadatas[index].description
                        .toString()
                        .split(regex)
                        .map((word, i) => {
                          if (word?.match(regex)) {
                            return (
                              <Link key={i} href={word} isExternal color={"blue.300"}>
                                {word}
                              </Link>
                            );
                          }
                        })}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Flex display="flex" flexDirection="column">
                <Box color="gray.600" fontSize="sm">
                  Creator: <ShortAddress address={nftMetadatas[index].creator} />
                  <Link href={`${ChainExplorer}/accounts/${nftMetadatas[index].creator}`} isExternal>
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box color="gray.600" fontSize="sm">
                  Owner: <ShortAddress address={item?.owner} />
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

              {feePrice && (
                <>
                  <Box fontSize="xs" mt="2">
                    <Text>
                      Fee per NFT: {` `}
                      {marketRequirements ? (
                        <>
                          {feePrice} {fee && itheumPrice ? `(${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}
                        </>
                      ) : (
                        " -"
                      )}
                    </Text>
                  </Box>
                </>
              )}

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
          backgroundColor="blackAlpha.700"
          backdropFilter="auto"
          backdropBlur="4px"
          rounded="lg"
          visibility={
            marketFreezedNonces &&
              item &&
              userData &&
              (userData.addressFrozen ||
                (userData.frozenNonces &&
                  item &&
                  (userData.frozenNonces.includes(item.offered_token_nonce) || marketFreezedNonces.includes(item.offered_token_nonce))))
              ? "visible"
              : "collapse"
          }>
          <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2" color="white">
            - FROZEN - <br />
            Data NFT is under investigation by the DAO as there was a complaint received against it
          </Text>
        </Box>
      </Box>
    </Skeleton>
  );
};

export default UpperCardComponent;
