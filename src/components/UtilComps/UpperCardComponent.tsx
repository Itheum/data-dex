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
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import { motion } from "framer-motion";
import moment from "moment/moment";
import { MdOutlineInfo } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CHAIN_TX_VIEWER, uxConfig } from "libs/config";
import { DataNftMetadataType, OfferType } from "libs/MultiversX/types";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { convertToLocalString, convertWeiToEsdt, getTokenWantedRepresentation, printPrice, tokenDecimals, transformDescription } from "libs/utils";
import { useMarketStore, useMintStore } from "store";
import ShortAddress from "./ShortAddress";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  nftMetadata: DataNftMetadataType;
  offer: OfferType;
  index: number;
  marketFreezedNonces: number[];
  children?: React.ReactNode;
  openNftDetailsDrawer?: (e: number) => void;
};

const UpperCardComponent: FC<UpperCardComponentProps> = ({
  nftImageLoading,
  setNftImageLoaded,
  imageUrl,
  nftMetadata,
  index,
  children,
  offer,
  marketFreezedNonces,
  openNftDetailsDrawer,
}) => {
  const { colorMode } = useColorMode();

  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const ChainExplorer = CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER];
  const navigate = useNavigate();

  const userData = useMintStore((state) => state.userData);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);

  const feePrice = offer
    ? printPrice(
        convertWeiToEsdt(offer.wanted_token_amount as BigNumber.Value, tokenDecimals(offer.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
      )
    : "";
  const fee = offer ? convertWeiToEsdt(offer.wanted_token_amount as BigNumber.Value, tokenDecimals(offer.wanted_token_identifier)).toNumber() : 0;

  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box
        w="275px"
        h={isMxLoggedIn ? "780px" : "700px"}
        mx="3 !important"
        borderWidth="0.5px"
        borderRadius="xl"
        borderColor="#00C79740"
        position="relative"
        mb="1rem">
        <Flex justifyContent="center">
          <Image
            src={imageUrl}
            alt={"item.dataPreview"}
            h={236}
            w={236}
            mx={6}
            mt={6}
            borderRadius="32px"
            onLoad={() => setNftImageLoaded(true)}
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <motion.button
            style={{
              position: "absolute",
              zIndex: "1",
              top: "0",
              bottom: "0",
              right: "0",
              left: "0",
              height: "236px",
              width: "236px",
              marginInlineStart: "1.2rem",
              marginInlineEnd: "1.2rem",
              marginTop: "1.5rem",
              borderRadius: "32px",
              cursor: "pointer",
              opacity: 0,
            }}
            onLoad={() => setNftImageLoaded(true)}
            onClick={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
            }}
            whileHover={{ opacity: 1, backdropFilter: "blur(1px)", backgroundColor: "#1b1b1ba0" }}
            transition={{ duration: 0.3 }}>
            <Text as="div" border="1px solid" borderColor="teal.400" borderRadius="5px" variant="outline" w={20} h={8} textAlign="center" mx="20">
              <Text as="p" mt={1} fontWeight="400" textColor="white">
                Details
              </Text>
            </Text>
          </motion.button>
        </Flex>

        <Flex h={address ? "28rem" : "18rem"} mx={6} my={3} direction="column" justify="space-between">
          {nftMetadata && (
            <>
              <Text fontSize="md" color="#929497">
                <Link href={`${ChainExplorer}/nfts/${nftMetadata.id}`} isExternal>
                  {nftMetadata.tokenName} <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Popover trigger="hover" placement="auto">
                <PopoverTrigger>
                  <div>
                    <Text fontWeight="semibold" fontSize="lg" mt="1.5">
                      {nftMetadata.title.length > 20 ? nftMetadata.title.substring(0, 19) + "..." : nftMetadata.title}
                    </Text>

                    <Flex flexGrow="1">
                      <Text fontSize="md" color="#929497" noOfLines={2} w="100%" h="10">
                        {transformDescription(nftMetadata.description)}
                      </Text>
                    </Flex>
                  </div>
                </PopoverTrigger>
                <PopoverContent mx="2" width="220px" mt="-7">
                  <PopoverHeader fontWeight="semibold" fontSize="lg">
                    {nftMetadata.title}
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Text fontSize="md" mt="1" color="gray.300">
                      {transformDescription(nftMetadata.description)}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Flex display="flex" flexDirection="column" mt={1}>
                <Box color="#8c8f92d0" fontSize="md" display="flex">
                  Creator:&nbsp;
                  <Flex alignItems="center" onClick={() => navigate(`/profile/${nftMetadata.creator}`)}>
                    <ShortAddress address={nftMetadata.creator} fontSize="md" tooltipLabel="Profile" />
                    <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797" }} fontSize="sm" />
                  </Flex>
                </Box>
                <Box color="#8c8f92d0" fontSize="md" display="flex">
                  Owner:&nbsp;
                  <Flex onClick={() => navigate(`/profile/${offer?.owner}`)}>
                    <ShortAddress address={offer?.owner} fontSize="md" tooltipLabel="Profile" />
                    <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797", marginTop: "4px" }} fontSize="lg" />
                  </Flex>
                </Box>
                <Stack display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" my="2" height="5rem">
                  {address && address == nftMetadata.creator && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#00C79730">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#00C797">
                        You are the Creator
                      </Text>
                    </Box>
                  )}

                  {address && address == offer?.owner && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#0ab8ff30">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#0ab8ff">
                        You are the Owner
                      </Text>
                    </Box>
                  )}

                  <Box borderRadius="md" px="3" py="1" bgColor="#E2AEEA30">
                    <Text fontSize={{ base: "xs", "2xl": "sm" }} fontWeight="semibold" color={colorMode === "dark" ? "#E2AEEA" : "#af82b5"}>
                      Fully Transferable License
                    </Text>
                  </Box>
                </Stack>
              </Flex>

              <Box display="flex" justifyContent="flex-start" mt="2">
                <Text fontSize="md" fontWeight="medium" color="#929497">{`Creation time:   ${moment(nftMetadata.creationTime).format(uxConfig.dateStr)}`}</Text>
              </Box>

              {nftMetadata && (
                <Box color="#8c8f92d0" fontSize="md" fontWeight="normal">
                  {`Listed: ${offer?.quantity}`} <br />
                  {`Total supply: ${nftMetadata?.supply}`} <br />
                  {`Royalty: ${convertToLocalString(nftMetadata?.royalties * 100)}%`}
                </Box>
              )}

              {feePrice && (
                <>
                  <Box fontSize="sm" mt="2">
                    <Text h="10 !important" noOfLines={2}>
                      Unlock from: {` `}
                      {
                        <>
                          {feePrice} {fee && itheumPrice ? `(~${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}
                        </>
                      }
                    </Text>
                  </Box>
                </>
              )}
              {children}
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
            offer &&
            userData &&
            (userData.addressFrozen ||
              (userData.frozenNonces &&
                offer &&
                (userData.frozenNonces.includes(offer.offered_token_nonce) || marketFreezedNonces.includes(offer.offered_token_nonce))))
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
    </Skeleton>
  );
};

export default UpperCardComponent;
