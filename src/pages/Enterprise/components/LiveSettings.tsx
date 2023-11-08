import React from "react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { TranslateBoolean } from "../../../libs/utils";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

type LiveSettingsProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};
export const LiveSettings: React.FC<LiveSettingsProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;

  const { address } = useGetAccountInfo();

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
    <Box as="div" flexDirection="column">
      <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
        Live Settings
      </Text>
      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={0.5}>
        <Text>Token Identifier: {viewContractConfig.tokenIdentifier}</Text>
        <Text>Minted Tokens: {viewContractConfig.mintedTokens}</Text>
        <Text>Is Tax Required: {TranslateBoolean(viewContractConfig.isTaxRequired)}</Text>
        <Text>Maximum Royalties: {viewContractConfig.maxRoyalties}</Text>
        <Text>Minimum Royalties: {viewContractConfig.minRoyalties}</Text>
        <Text>Mint Time Limit: {viewContractConfig.mintTimeLimit}</Text>
        <Text>Is Whitelist Enabled: {TranslateBoolean(viewContractConfig.isWhitelistEnabled)}</Text>
        <Text>Is Contract Pause: {TranslateBoolean(viewContractConfig.isContractPaused)}</Text>
        <Text>Roles Are Set: {TranslateBoolean(viewContractConfig.rolesAreSet)}</Text>
        <Text>Claims Address: {viewContractConfig.claimsAddress}</Text>
        <Text>Administrator Address: {viewContractConfig.administratorAddress}</Text>

        <Flex flexDirection="row" gap={5}>
          <Flex flexDirection="column" pt={3}>
            <IconButton
              aria-label="Pause contract"
              icon={<AiFillPlayCircle size="lg" color="#00C797" />}
              variant="ghost"
              size="lg"
              isDisabled={!viewContractConfig.isContractPaused}
              onClick={() => unPauseContract(new Address(address))}
            />
            <Text>UnPause Minter</Text>
          </Flex>
          <Flex flexDirection="column" pt={3}>
            <IconButton
              aria-label="Pause contract"
              icon={<AiFillPauseCircle size="lg" color="#00C797" />}
              variant="ghost"
              size="lg"
              isDisabled={viewContractConfig.isContractPaused}
              onClick={() => pauseContract(new Address(address))}
            />
            <Text>Pause Minter</Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
