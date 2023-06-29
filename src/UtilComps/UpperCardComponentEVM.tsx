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
  HStack,
  Badge,
  useColorMode,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import ShortAddress from "./ShortAddress";
import { CHAIN_TX_VIEWER, styleStrings, uxConfig } from "../libs/util";
import { convertToLocalString, transformDescription } from "../libs/util2";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType } from "../MultiversX/typesEVM";
import { useChainMeta } from "../store/ChainMetaContext";
import blueTickIcon from "img/creator-verified.png";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
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

const UpperCardComponentEVM: FC<UpperCardComponentProps> = (props) => {
  const { colorMode } = useColorMode();
  const {
    nftImageLoading,
    setNftImageLoaded,
    imageUrl,
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
  // const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const feePrice = "";
  const fee = 0;

  let gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRight;

  if (colorMode === "light") {
    gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRightLight;
  }

  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box
        backgroundColor="green"
        w="275px"
        h="670px"
        mx="3 !important"
        borderWidth="0.5px"
        borderRadius="xl"
        position="relative"
        mb="1rem"
        style={{ background: gradientBorderForTrade }}>
        <Flex justifyContent="center" backgroundColor="none">
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

        <Flex backgroundColor="none" h={_chainMeta.loggedInAddress ? "380px" : "10rem"} mx={6} my={3} direction="column" justify="space-between">
          {nftMetadatas[index] && (
            <>
              <Text fontSize="md" color="#929497">
                <Link
                  href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/erc721_inventory?tokenID=${nftMetadatas[index].id}&contract=${
                    _chainMeta.contracts.dnft
                  }`}
                  isExternal>
                  NFT ID {nftMetadatas[index].id} <ExternalLinkIcon mx="2px" />
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
              <Flex backgroundColor="none" display="flex" flexDirection="column" mt={1}>
                {nftMetadatas[index].creator !== "" && (
                  <Box color="#8c8f9282" fontSize="md">
                    <HStack>
                      {nftMetadatas[index].creator === "0x950c869b1af2543154bd668d83188c1bc77bf82c" && <Image h="20px" src={blueTickIcon} />}
                      Creator: <ShortAddress address={nftMetadatas[index].creator} fontSize="md" />
                      <Link href={`${ChainExplorer}/accounts/${nftMetadatas[index].creator}`} isExternal>
                        <ExternalLinkIcon ml="5px" fontSize="sm" />
                      </Link>
                    </HStack>
                  </Box>
                )}
                <Box color="#8c8f9282" fontSize="md">
                  <HStack>
                    {item?.owner === "0x950c869b1af2543154bd668d83188c1bc77bf82c" && <Image h="20px" src={blueTickIcon} />}
                    Owner: <ShortAddress address={item?.owner} fontSize="md" />
                    <Link href={`${ChainExplorer}/accounts/${item?.owner}`} isExternal>
                      <ExternalLinkIcon ml="5px" fontSize="sm" />
                    </Link>
                  </HStack>
                </Box>
                <Stack display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" my="2">
                  {_chainMeta.loggedInAddress && _chainMeta.loggedInAddress == nftMetadatas[index].creator && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#00C79730">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#00C797">
                        You are the Creator
                      </Text>
                    </Box>
                  )}

                  {_chainMeta.loggedInAddress && _chainMeta.loggedInAddress == item?.owner && (
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

              {/* <Box display="flex" justifyContent="flex-start" mt="2">
                <Text fontSize="md" fontWeight="medium" color="#929497">{`Creation time:   ${moment(nftMetadatas[index].creationTime).format(
                  uxConfig.dateStr
                )}`}</Text>
              </Box> */}

              {nftMetadatas[index] && (
                <Box backgroundColor="none" fontSize="md" fontWeight="normal" my={2}>
                  {`Royalty: ${nftMetadatas[index]?.royalties === -2 ? "Loading..." : nftMetadatas[index]?.royalties}%`}

                  <HStack>
                    <Text>Tradable: </Text>
                    `Tradable: $
                    {nftMetadatas[index]?.secondaryTradeable === -2
                      ? "Loading..."
                      : (nftMetadatas[index]?.secondaryTradeable === 1 && (
                          <Badge borderRadius="sm" colorScheme="teal">
                            Yes
                          </Badge>
                        )) || (
                          <Badge borderRadius="sm" colorScheme="red">
                            No
                          </Badge>
                        )}
                  </HStack>
                  <HStack>
                    <Text>Transferable: </Text>
                    {nftMetadatas[index]?.transferable === -2
                      ? "Loading..."
                      : (nftMetadatas[index]?.transferable === 1 && (
                          <Badge borderRadius="sm" colorScheme="teal">
                            Yes
                          </Badge>
                        )) || (
                          <Badge borderRadius="sm" colorScheme="red">
                            No
                          </Badge>
                        )}
                  </HStack>

                  {`Listed: ${item?.quantity} (max supply: ${nftMetadatas[index]?.supply})`}
                </Box>
              )}

              {_chainMeta.loggedInAddress && <>{children}</>}
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

export default UpperCardComponentEVM;
