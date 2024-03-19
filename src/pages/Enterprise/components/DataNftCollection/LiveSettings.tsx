import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";
import ShortAddress from "../../../../components/UtilComps/ShortAddress";
import { TranslateBoolean } from "../../../../libs/utils";

type LiveSettingsProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};
export const LiveSettings: React.FC<LiveSettingsProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;

  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  // console.log(viewContractConfig);
  const unPauseContract = async (senderAddress: IAddress) => {
    await sendTransactions({
      transactions: [nftMinter.unpauseContract(senderAddress)],
    });
  };
  const pauseContract = async (senderAddress: IAddress) => {
    await sendTransactions({
      transactions: [nftMinter.pauseContract(senderAddress)],
    });
  };

  return (
    <Box as="div" flexDirection="column" border="1px solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "33%" }}>
      <Box bgColor="#00C7970D" roundedTop="3xl">
        <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
          Live Settings:
        </Text>
      </Box>
      <Flex px={10} py={4} flexDirection="column" justifyItems="start" alignItems="start" gap={3} bgColor="#1b1b1b50">
        <Text>Token Identifier: {viewContractConfig.tokenIdentifier}</Text>
        <Text>Minted Tokens: {viewContractConfig.mintedTokens}</Text>
        <Text>Is Tax Required: {TranslateBoolean(viewContractConfig.isTaxRequired)}</Text>
        <Text>Maximum Royalties: {viewContractConfig.maxRoyalties / 100}%</Text>
        <Text>Minimum Royalties: {viewContractConfig.minRoyalties}%</Text>
        <Text>Mint Time Limit: {viewContractConfig.mintTimeLimit}</Text>
        <Text>Is Whitelist Enabled: {TranslateBoolean(viewContractConfig.isWhitelistEnabled)}</Text>
        <Text>Is Contract Pause: {TranslateBoolean(viewContractConfig.isContractPaused)}</Text>
        <Text>Roles Are Set: {TranslateBoolean(viewContractConfig.rolesAreSet)}</Text>
        <Text>
          Claims Address: <ShortAddress address={viewContractConfig.claimsAddress} fontSize="lg" />
        </Text>
        <Text>
          Administrator Address: <ShortAddress address={viewContractConfig.administratorAddress} fontSize="lg" />
        </Text>
      </Flex>
      <Flex flexDirection="row" gap={5} px={10} py={4} bgColor="#00C7970D" roundedBottom="3xl" justifyContent="center">
        <Flex flexDirection="column">
          <Button
            aria-label="UnPause contract"
            isLoading={hasPendingTransactions}
            loadingText="Loading"
            variant="ghost"
            size="md"
            isDisabled={!viewContractConfig.isContractPaused}
            onClick={() => unPauseContract(new Address(address))}>
            <AiFillPlayCircle size="lg" color="#00C797" />
          </Button>
          <Text>Unpause Minter</Text>
        </Flex>
        <Flex flexDirection="column">
          <Button
            aria-label="Pause contract"
            isLoading={hasPendingTransactions}
            loadingText="Loading"
            variant="ghost"
            size="md"
            isDisabled={viewContractConfig.isContractPaused}
            onClick={() => pauseContract(new Address(address))}>
            <AiFillPauseCircle size="lg" color="#00C797" />
          </Button>
          <Text>Pause Minter</Text>
        </Flex>
      </Flex>
    </Box>
  );
};
