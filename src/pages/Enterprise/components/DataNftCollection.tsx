import React, { useEffect } from "react";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { Box, Flex, Text } from "@chakra-ui/react";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { LiveSettings } from "./LiveSettings";

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
      <Text fontSize="2xl" fontFamily="Clash-Bold" py={3}>
        Your Data NFT Collection
      </Text>
      <Flex flexDirection="row">
        <LiveSettings nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
      </Flex>
    </Box>
  );
};
