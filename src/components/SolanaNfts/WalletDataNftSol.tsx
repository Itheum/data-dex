import React from "react";

import {
  Badge,
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
  Text,
} from "@chakra-ui/react";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import NftMediaComponent from "components/NftMediaComponent";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { SOLANA_EXPLORER_URL } from "libs/Solana/config";
import { useNetworkConfiguration } from "contexts/sol/SolNetworkConfigurationProvider";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { transformDescription } from "libs/utils";
import ShortAddress from "components/UtilComps/ShortAddress";
import { MdOutlineInfo } from "react-icons/md";
import { useWallet } from "@solana/wallet-adapter-react";

interface WalletDataNftSolProps {
  index: number;
  solDataNft: DasApiAsset;
}

const WalletDataNftSol: React.FC<WalletDataNftSolProps> = ({ index, solDataNft }) => {
  const { networkConfiguration } = useNetworkConfiguration();
  console.log(solDataNft);
  const { publicKey } = useWallet();
  const isCreator = solDataNft.creators && solDataNft.creators.some((creator) => creator.address === publicKey?.toBase58());
  const longText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  +"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  +"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  return (
    <Skeleton fitContent={true} isLoaded={true} borderRadius="16px" display="flex" alignItems="center" justifyContent="center">
      <Box
        key={index}
        w="275px"
        h={"460px"}
        mx="3 !important"
        border="1px solid transparent"
        borderColor="#00C79740"
        borderRadius="16px"
        mb="1rem"
        position="relative">
        <NftMediaComponent
          imageUrls={[solDataNft.content.links && solDataNft.content.links["image"] ? (solDataNft.content.links["image"] as string) : DEFAULT_NFT_IMAGE]}
          autoSlide
          imageHeight="236px"
          imageWidth="236px"
          autoSlideInterval={Math.floor(Math.random() * 6000 + 6000)} // random number between 6 and 12 seconds
          onLoad={() => {}}
          openNftDetailsDrawer={() => {
            window.open(solDataNft.content.json_uri, "_blank");
          }}
          marginTop="1.5rem"
          borderRadius="16px"
        />
        <Flex h="14rem" mx={6} direction="column">
          <Text fontWeight="semibold" fontSize="lg" mt="1.5" noOfLines={1}>
            {solDataNft.content.metadata.name}
          </Text>
          <Link
            onClick={() => window.open(`${SOLANA_EXPLORER_URL}address/${solDataNft.id}?cluster=${networkConfiguration}`, "_blank")}
            fontSize="md"
            color="#929497">
            <ShortAddress address={solDataNft.id} fontSize="lg" tooltipLabel="Profile" /> <ExternalLinkIcon ml={1} mt={-2} />
          </Link>{" "}
          <Box>
            <Popover trigger="hover" placement="auto">
              <PopoverTrigger>
                <Flex flexGrow="1" mt={4}>
                  <Text fontSize="md" color="#929497" noOfLines={2} w="100%" h="10">
                    {solDataNft.content.metadata.description && transformDescription(solDataNft.content.metadata.description)}
                  </Text>
                </Flex>
              </PopoverTrigger>
              <PopoverContent mx="2" width="220px" mt="-7">
                <PopoverHeader fontWeight="semibold" fontSize="lg">
                  Description
                </PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <Text fontSize="md" mt="1" color="#929497">
                    {solDataNft.content.metadata.description && transformDescription(solDataNft.content.metadata.description)}
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
          {/* <Badge borderRadius="md" px="3" py="1" mt="1" bgColor={!isCreator ? "#0ab8ff30" : "#00C79730"}>
            <Text fontSize={{ base: "xs", "2xl": "sm" }} fontWeight="semibold" color={!isCreator ? "#0ab8ff" : "#00C797"}>
              You {!isCreator ? "Own" : "Created"} this
            </Text>
          </Badge> */}
          {solDataNft.creators && (
            <Box mt={3} color="#8c8f92d0" fontSize="md" display="flex" alignItems="start">
              Creator{solDataNft.creators.length > 1 && "s"}:&nbsp;{" "}
              <Flex w={"full"} alignItems="center" key={index} flexDirection={"column"} maxH="100px" overflowY="auto" scrollBehavior={"auto"}>
                {solDataNft.creators.map((creator, index) => (
                  <Link
                    display="flex"
                    alignItems="center"
                    key={index}
                    isExternal
                    href={`${SOLANA_EXPLORER_URL}address/${creator.address}?cluster=${networkConfiguration}`}>
                    <ShortAddress address={creator.address} fontSize="lg" tooltipLabel="Profile" />{" "}
                    <MdOutlineInfo style={{ marginLeft: "5px", color: "#00c797" }} fontSize="lg" />
                  </Link>
                ))}
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>
    </Skeleton>
  );
};

export default WalletDataNftSol;
