import React, { useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useNavigate } from "react-router-dom";
import { ClaimRoyalties } from "./ClaimRoyalties";
import { CurateNfts } from "./CurateNfts";
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
  const navigate = useNavigate();
  const { address } = useGetAccountInfo();

  useEffect(() => {
    if (viewContractConfig?.administratorAddress !== address) {
      navigate("/");
    } else {
      return;
    }
  }, []);

  return (
    <Box>
      <Flex flexDirection="column" gap={5}>
        <Flex gap="5" flexDirection={{ base: "column", xl: "row" }}>
          <LiveSettings nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
          <Flex flexDirection="column" border="0.01rem solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "67%" }}>
            <Box bgColor="#00C7970D" roundedTop="3xl">
              <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
                Settings
              </Text>
            </Box>
            <Box px={10} py={4} bg="#1b1b1b50" roundedBottom="3xl" h="32rem" overflowY="scroll">
              <TransferControl nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
              <WhitelistControl nftMinter={nftMinter} />
              <UpdateOtherSettings nftMinter={nftMinter} claimAddress={viewContractConfig.claimsAddress} />
            </Box>
          </Flex>
        </Flex>
        <Flex gap="5" flexDirection={{ base: "column", xl: "row" }}>
          <ClaimRoyalties nftMinter={nftMinter} claimAddress={viewContractConfig.claimsAddress} />
          <MintDataNft nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        </Flex>
        <CurateNfts nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
      </Flex>
    </Box>
  );
};
