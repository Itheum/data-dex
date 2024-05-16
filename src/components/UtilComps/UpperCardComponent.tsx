import React, { Dispatch, FC, SetStateAction } from "react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
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
import { DataNft, Offer } from "@itheum/sdk-mx-data-nft/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { MdOutlineInfo } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import FrozenOverlay from "components/FrozenOverlay";
import NftMediaComponent from "components/NftMediaComponent";
import { CHAIN_TX_VIEWER, uxConfig } from "libs/config";
import { convertToLocalString, convertWeiToEsdt, getTokenWantedRepresentation, printPrice, tokenDecimals, transformDescription } from "libs/utils";
import { useMarketStore, useMintStore } from "store";
import ShortAddress from "./ShortAddress";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  nftMetadata: DataNft;
  offer: Offer;
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
        convertWeiToEsdt(offer.wantedTokenAmount as BigNumber.Value, tokenDecimals(offer.wantedTokenIdentifier)).toNumber(),
        getTokenWantedRepresentation(offer.wantedTokenIdentifier, offer.wantedTokenNonce)
      )
    : "";
  const fee = offer ? convertWeiToEsdt(offer.wantedTokenAmount as BigNumber.Value, tokenDecimals(offer.wantedTokenIdentifier)).toNumber() : 0;
  const parsedCreationTime = moment(nftMetadata?.creationTime);
  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box
        w="275px"
        h={isMxLoggedIn ? "880px" : "800px"}
        mx="5 !important"
        borderWidth="0.5px"
        borderRadius="xl"
        borderColor="#00C79740"
        position="relative"
        mb="1.5rem">
        <NftMediaComponent
          imageUrls={nftMetadata?.media?.map((mediaObj: any) => mediaObj.url) ?? [imageUrl]}
          autoSlide
          imageHeight="236px"
          imageWidth="236px"
          autoSlideInterval={Math.floor(Math.random() * 6000 + 6000)} // random number between 6 and 12 seconds
          onLoad={() => setNftImageLoaded(true)}
          openNftDetailsDrawer={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}
          marginTop="1.5rem"
        />

        <Flex h={address ? "28rem" : "18rem"} mx={6} my={3} direction="column" justify="space-between">
          {nftMetadata && (
            <>
              <Text fontSize="md" color="#929497">
                <Link href={`${ChainExplorer}/nfts/${nftMetadata.tokenIdentifier}`} isExternal>
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
                        You Created this
                      </Text>
                    </Box>
                  )}

                  {address && address == offer?.owner && (
                    <Box borderRadius="md" px="3" py="1" bgColor="#0ab8ff30">
                      <Text fontSize={"sm"} fontWeight="semibold" color="#0ab8ff">
                        You Own this
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
                {parsedCreationTime.isValid() && (
                  <Text fontSize="md" fontWeight="medium" color="#929497">{`Creation time:   ${parsedCreationTime.format(uxConfig.dateStr)}`}</Text>
                )}
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
                      Get from: {` `}
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
        <FrozenOverlay
          isVisible={
            marketFreezedNonces &&
            offer &&
            userData &&
            (userData.addressFrozen ||
              (userData.frozenNonces &&
                offer &&
                (userData.frozenNonces.includes(offer.offeredTokenNonce) || marketFreezedNonces.includes(offer.offeredTokenNonce))))
          }
        />
      </Box>
    </Skeleton>
  );
};

export default UpperCardComponent;
