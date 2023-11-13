import React, { useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { LiveSettings } from "./LiveSettings";
import { TransferControl } from "./TransferControl";
import { WhitelistControl } from "./WhitelistControl";
import { UpdateOtherSettings } from "./UpdateOtherSettings";
import { ClaimRoyalties } from "./ClaimRoyalties";
import { MintDataNft } from "./MintDataNft";

type DataNftCollectionProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const DataNftCollection: React.FC<DataNftCollectionProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;

  const { address } = useGetAccountInfo();
  const setRoles = async (senderAddress: IAddress) => {
    await sendTransactions({
      transactions: [nftMinter.setLocalRoles(senderAddress)],
    });
  };

  useEffect(() => {
    if (viewContractConfig?.tokenIdentifier !== "" && viewContractConfig?.rolesAreSet === false) {
      setRoles(new Address(address));
    }
  }, [viewContractConfig]);

  return (
    <Box>
      <Text fontSize="2rem" fontFamily="Clash-Medium" py={3}>
        Your Data NFT Collection
      </Text>
      <Flex flexDirection="column" gap={5}>
        <LiveSettings nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        <TransferControl nftMinter={nftMinter} />
        <WhitelistControl nftMinter={nftMinter} />
        <UpdateOtherSettings nftMinter={nftMinter} />
        <ClaimRoyalties nftMinter={nftMinter} claimAddress={viewContractConfig.claimsAddress} />
        <MintDataNft nftMinter={nftMinter} />
      </Flex>
    </Box>
  );
};
