import React from "react";
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
  Text,
  Spacer,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { motion } from "framer-motion";
import moment from "moment/moment";
import { CHAIN_TX_VIEWER, uxConfig } from "libs/config";
import { getApi } from "libs/MultiversX/api";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { convertToLocalString, createNftId, transformDescription } from "libs/utils";

const ProfileCard = ({
  index,
  collection,
  nonce,
  tokenName,
  title,
  description,
  supply,
  royalties,
  creationTime,
  openNftDetailsDrawer,
  hasLoaded,
  setHasLoaded,
}: {
  index: number;
  collection: string;
  nonce: number;
  tokenName: string;
  title: string;
  description: string;
  supply: number;
  royalties: number;
  creationTime: Date;
  openNftDetailsDrawer: any;
  hasLoaded: boolean;
  setHasLoaded: any;
}) => {
  const { chainID } = useGetNetworkConfig();
  const ChainExplorer = CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER];

  const nftId = createNftId(collection, nonce);
  const imageUrl = collection ? `https://${getApi(chainID)}/nfts/${nftId}/thumbnail` : DEFAULT_NFT_IMAGE;

  return (
    <Skeleton fitContent={true} isLoaded={hasLoaded} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Box w="275px" h="30rem" mx="3 !important" borderWidth="0.5px" borderRadius="xl" borderColor="#00C79740" position="relative" mb="1rem">
        <Flex justifyContent="center">
          <Image
            src={imageUrl}
            alt={"dataPreview"}
            h={236}
            w={236}
            mx={6}
            mt={6}
            borderRadius="32px"
            onLoad={() => setHasLoaded(true)}
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
            onLoad={() => setHasLoaded(true)}
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

        <Flex h="11rem" mx={6} my={3} direction="column" justify="space-between">
          <Text fontSize="md" color="#929497" textAlign="center" mt="1">
            <Link href={`${ChainExplorer}/nfts/${nftId}`} isExternal>
              {tokenName} <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>

          <Popover trigger="hover" placement="auto">
            <PopoverTrigger>
              <div>
                <Text fontWeight="semibold" fontSize="lg" mt="1" noOfLines={1}>
                  {title}
                </Text>

                <Flex flexGrow="1">
                  <Text fontSize="md" color="#929497" noOfLines={2} w="100%" h="10">
                    {transformDescription(description)}
                  </Text>
                </Flex>
              </div>
            </PopoverTrigger>
            <PopoverContent mx="2" width="220px" mt="-7">
              <PopoverHeader fontWeight="semibold" fontSize="lg">
                {title}
              </PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <Text fontSize="md" mt="1" color="#929497">
                  {transformDescription(description)}
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Box fontSize="md" fontWeight="normal">
            <Flex>
              <Box color="#8c8f92d0">Total Supply:</Box>
              <Spacer />
              <Box>{supply}</Box>
            </Flex>
            <Flex>
              <Box color="#8c8f92d0">Royalty:</Box>
              <Spacer />
              <Box>{convertToLocalString(royalties * 100)}%</Box>
            </Flex>
            <Flex>
              <Box color="#8c8f92d0">Creation Time:</Box>
              <Spacer />
              <Box>{moment(creationTime).format(uxConfig.dateStr)}</Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Skeleton>
  );
};

export default ProfileCard;
