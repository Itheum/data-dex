import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { LiveSettings } from "./LiveSettings";
import { TransferControl } from "./TransferControl";
import { WhitelistControl } from "./WhitelistControl";
import { UpdateOtherSettings } from "./UpdateOtherSettings";
import { ClaimRoyalties } from "./ClaimRoyalties";
import { MintDataNft } from "./MintDataNft";
import { CurateNfts } from "./CurateNfts";

type DataNftCollectionProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const DataNftCollection: React.FC<DataNftCollectionProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;

  return (
    <Box>
      <Text fontSize="2rem" fontFamily="Clash-Medium" py={3}>
        Your Data NFT Collection
      </Text>
      <Flex flexDirection="column" gap={5}>
        <LiveSettings nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        <TransferControl nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        <WhitelistControl nftMinter={nftMinter} />
        <UpdateOtherSettings nftMinter={nftMinter} />
        <ClaimRoyalties nftMinter={nftMinter} claimAddress={viewContractConfig.claimsAddress} />
        <MintDataNft nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        <CurateNfts nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
      </Flex>
    </Box>
  );
};
