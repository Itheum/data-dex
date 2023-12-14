import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { ClaimRoyalties } from "./ClaimRoyalties";
import { LiveSettings } from "./LiveSettings";
import { MintDataNft } from "./MintDataNft";
import { TransferControl } from "./TransferControl";
import { UpdateOtherSettings } from "./UpdateOtherSettings";
import { WhitelistControl } from "./WhitelistControl";

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
        <MintDataNft nftMinter={nftMinter} antiSpamTaxToken={viewContractConfig.taxToken} />
      </Flex>
    </Box>
  );
};
