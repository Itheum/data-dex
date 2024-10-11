import React from "react";

import { Box, Skeleton } from "@chakra-ui/react";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import NftMediaComponent from "components/NftMediaComponent";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";

interface WalletDataNftSolProps {
  index: number;
  solDataNft: DasApiAsset;
}

const WalletDataNftSol: React.FC<WalletDataNftSolProps> = ({ index, solDataNft }) => {
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
          openNftDetailsDrawer={() => {}}
          marginTop="1.5rem"
          borderRadius="16px"
        />
        <Box gap={"16px"} mx="3 !important">
          <h3>{solDataNft.content.metadata.description}</h3>
          <p>Name: {solDataNft.content.metadata.name}</p>
          <p>Token Standard: {solDataNft.content.metadata.token_standard}</p>
        </Box>
      </Box>
    </Skeleton>
  );
};

export default WalletDataNftSol;
