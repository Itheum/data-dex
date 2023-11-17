import React, { useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { LiveSettings } from "./LiveSettings";
import { TransferControl } from "./TransferControl";
import { WhitelistControl } from "./WhitelistControl";
import { UpdateOtherSettings } from "./UpdateOtherSettings";
import { ClaimRoyalties } from "./ClaimRoyalties";
import { MintDataNft } from "./MintDataNft";
import { Address } from "@multiversx/sdk-core/out";

type DataNftCollectionProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const DataNftCollection: React.FC<DataNftCollectionProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;

  const { address } = useGetAccountInfo();

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
