import React, { Dispatch, FC, SetStateAction } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
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
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import ShortAddress from "./ShortAddress";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, styleStrings, uxConfig } from "../libs/util";
import { convertToLocalString, printPrice, transformDescription } from "../libs/util2";
import { getTokenWantedRepresentation, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";
import { useMarketStore, useMintStore } from "store";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  nftMetadatas: DataNftMetadataType[];
  item?: ItemType;
  index: number;
  marketFreezedNonces: number[];
  children?: React.ReactNode;
  openNftDetailsDrawer?: (e: number) => void;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const { colorMode } = useColorMode();
  const {
    nftImageLoading,
    setNftImageLoaded,
    imageUrl,
    nftMetadatas,
    index,
    children,
    item,
    marketFreezedNonces,
    openNftDetailsDrawer,
  } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const userData = useMintStore((state) => state.userData);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);

  const feePrice = item
    ? printPrice(
        convertWeiToEsdt(item.wanted_token_amount as BigNumber.Value, tokenDecimals(item.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(item?.wanted_token_identifier, item.wanted_token_nonce)
      )
    : "";
  const fee = item ? convertWeiToEsdt(item.wanted_token_amount as BigNumber.Value, tokenDecimals(item.wanted_token_identifier)).toNumber() : 0;

  let gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRight;

  if (colorMode === "light") {
    gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRightLight;
  }

  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box
        w="275px"
        h="760px"
        mx="3 !important"
        borderWidth="0.5px"
        borderRadius="xl"
        position="relative"
        mb="1rem"
        style={{ background: gradientBorderForTrade }}>
        <Flex justifyContent="center">
          <Image
            src={imageUrl}
            alt={"item.dataPreview"}
            h={236}
            w={236}
            mx={6}
            mt={6}
            borderRadius="32px"
            cursor="pointer"
            onLoad={() => setNftImageLoaded(true)}
            onClick={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
        </Flex>

        <Flex h={address ? "28rem" : "18rem"} mx={6} my={3} direction="column" justify="space-between">
          {nftMetadatas[index] && (
            <>
              <Text fontSize="md" color="#929497">
                <Link href={`${ChainExplorer}/nfts/${nftMetadatas[index].id}`} isExternal>
                  {nftMetadatas[index].tokenName} <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Popover trigger="hover" placement="auto">
                <PopoverTrigger>
                  <div>
                    <Text fontWeight="semibold" fontSize="lg" mt="1.5">
                      {nftMetadatas[index].title.length > 20 ? nftMetadatas[index].title.substring(0, 19) + "..." : nftMetadatas[index].title}
                    </Text>

                    <Flex flexGrow="1">
                      <Text fontSize="md" color="#929497" noOfLines={2} w="100%" h="10">
                        {transformDescription(nftMetadatas[index].description)}
                      </Text>
                    </Flex>
                  </div>
                </PopoverTrigger>
                <PopoverContent mx="2" width="220px" mt="-7">
                  <PopoverHeader fontWeight="semibold" fontSize="lg">
                    {nftMetadatas[index].title}
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Text fontSize="md" mt="1" color="gray.300">
                      {transformDescription(nftMetadatas[index].description)}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Flex display="flex" flexDirection="column" mt={1}>
                <Box color="#8c8f9282" fontSize="md">
                  Creator: <ShortAddress address={nftMetadatas[index].creator} fontSize="md" />
                  <Link href={`${ChainExplorer}/accounts/${nftMetadatas[index].creator}`} isExternal>
                    <ExternalLinkIcon ml="5px" fontSize="sm" />
                  </Link>
                </Box>
                <Box color="#8c8f9282" fontSize="md">
                  Owner: <ShortAddress address={item?.owner} fontSize="md" />
                  <Link href={`${ChainExplorer}/accounts/${item?.owner}`} isExternal>
                    <ExternalLinkIcon ml="5px" fontSize="sm" />
                  </Link>
                </Box>
                <Stack display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" my="2" height="5rem">
                  {address && address == nftMetadatas[index].creator && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#00C79730">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#00C797">
                        You are the Creator
                      </Text>
                    </Box>
                  )}

                  {address && address == item?.owner && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#0ab8ff30">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#0ab8ff">
                        You are the Owner
                      </Text>
                    </Box>
                  )}

                  <Box borderRadius="md" px="3" py="1" bgColor="#E2AEEA30">
                    <Text fontSize={{ base: "xs", "2xl": "sm" }} fontWeight="semibold" color="#E2AEEA">
                      Fully Transferable License
                    </Text>
                  </Box>
                </Stack>
              </Flex>

              <Box display="flex" justifyContent="flex-start" mt="2">
                <Text fontSize="md" fontWeight="medium" color="#929497">{`Creation time:   ${moment(nftMetadatas[index].creationTime).format(
                  uxConfig.dateStr
                )}`}</Text>
              </Box>

              {nftMetadatas[index] && (
                <Box color="#8c8f9282" fontSize="md" fontWeight="normal">
                  {`Listed: ${item?.quantity}`} <br />
                  {`Total supply: ${nftMetadatas[index]?.supply}`} <br />
                  {`Royalty: ${convertToLocalString(nftMetadatas[index]?.royalties * 100)}%`}
                </Box>
              )}

              {feePrice && (
                <>
                  <Box fontSize="xs" mt="2">
                    <Text>
                      Unlock from: {` `}
                      {<>{feePrice} {fee && itheumPrice ? `(${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}</>}
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
