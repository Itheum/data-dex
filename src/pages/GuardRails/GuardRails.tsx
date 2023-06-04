import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text } from "@chakra-ui/react";
import { ResultsParser } from "@multiversx/sdk-core/out";
import { FaWallet } from "react-icons/fa";
import { GuardRailsCards } from "./components/guardRailsCards";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { historicGuardrails, upcomingGuardRails, whitelistWallets } from "../../libs/config";
import { getNetworkProvider } from "../../libs/MultiversX/api";
import { DataNftMintContract } from "../../libs/MultiversX/dataNftMint";
import { convertWeiToEsdt } from "../../libs/utils";
import { useMarketStore, useMintStore } from "../../store";
import { useChainMeta } from "../../store/ChainMetaContext";

export const GuardRails: React.FC = () => {
  const [whitelistedAddress, setWhitelistedAddress] = useState<React.ReactNode>();
  const [minRoyalties, setMinRoyalties] = useState(-1);
  const [maxRoyalties, setMaxRoyalties] = useState(-1);
  const [maxSupply, setMaxSupply] = useState(-1);
  const [antiSpamTax, setAntiSpamTax] = useState(-1);

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const userData = useMintStore((state) => state.userData);

  const { chainMeta: _chainMeta } = useChainMeta();
  const mxDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);

  const historyGuardrails = historicGuardrails;

  useEffect(() => {
    if (!_chainMeta.networkId) return;

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
      const interaction = mxDataNftMintContract.contract.methods.getMinRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMinRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
      const interaction = mxDataNftMintContract.contract.methods.getMaxRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
      const interaction = mxDataNftMintContract.contract.methods.getMaxSupply();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxSupply(value.toNumber());
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
      const interaction = mxDataNftMintContract.contract.methods.getAntiSpamTax([_chainMeta.contracts.itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setAntiSpamTax(convertWeiToEsdt(value).toNumber());
      }
    })();
  }, [_chainMeta.networkId]);

  useEffect(() => {
    const whitelistMap = (
      <>
        {whitelistWallets.map((wl, index) => {
          return (
            <Tag key={index} size="lg" variant="subtle" colorScheme="cyan" m={1.5} maxW="200px">
              <TagLeftIcon boxSize="12px" as={FaWallet} />
              <TagLabel>
                <ShortAddress address={wl} />
              </TagLabel>
            </Tag>
          );
        })}
      </>
    );
    setWhitelistedAddress(whitelistMap);
  }, []);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontWeight="medium" mt={14} mb={1}>
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent={{ base: "center", lg: "space-between" }} mt={5} flexWrap="wrap">
        <Box border="1px solid transparent" borderColor="#00C79740" borderRadius="22px" width="26rem">
          <Text
            textAlign="center"
            fontWeight="600"
            borderTopRadius="22px"
            py={3}
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="22px">
            Active Guardrails
          </Text>
          <Stack>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Buyer fee:&nbsp;
              {marketRequirements?.buyer_fee ? (
                <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                  <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                    {`${(marketRequirements?.buyer_fee / 100).toFixed(2)} %` ?? "-"}
                  </Text>
                </Badge>
              ) : (
                "-"
              )}
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Seller fee:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.seller_fee ? `${(marketRequirements.seller_fee / 100).toFixed(2)} %` : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum payment fees:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.maximum_payment_fees ? (marketRequirements.maximum_payment_fees as unknown as number) / Math.pow(10, 18) : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Minimum royalties:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {minRoyalties !== null ? minRoyalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum royalties:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {maxRoyalties ? maxRoyalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Time between mints:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {userData?.mintTimeLimit ? new Date(userData.lastUserMintTime + userData.mintTimeLimit).toLocaleString() : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Max Data NFT supply:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {maxSupply ? maxSupply : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Anti-Spam fee:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {antiSpamTax ? antiSpamTax : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Accepted payments:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.accepted_payments ?? "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.accepted_tokens ?? "-"}
                </Text>
              </Badge>
            </Text>
          </Stack>
        </Box>
        <GuardRailsCards items={historyGuardrails} title="History Guardrails" badgeColor="#E2AEEA1A" textColor="#E2AEEA" />

        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" width="20.5rem">
          <Text
            textAlign="center"
            fontWeight="600"
            borderTopRadius="22px"
            py={3}
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="22px">
            Upcoming Guardrails
          </Text>
          <Stack>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails.buyer_fee ? upcomingGuardRails.buyer_fee : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.seller_fee ? upcomingGuardRails.seller_fee : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Maximum payment fees:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.maximum_payment_fees ? upcomingGuardRails?.maximum_payment_fees : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Minimum royalties:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.minimum_royalties ? upcomingGuardRails.minimum_royalties : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Maximum royalties:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.maximum_royalties ? upcomingGuardRails?.maximum_royalties : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Time between mints:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.time_between_mints ? upcomingGuardRails?.time_between_mints : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Max Data NFT supply:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.max_data_nft_supply ? upcomingGuardRails?.max_data_nft_supply : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Anti-Spam fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.antiSpam_tax ? upcomingGuardRails?.antiSpam_tax : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted payments:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.accepted_payments ? upcomingGuardRails?.accepted_payments : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge color="gray.400" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {upcomingGuardRails?.accepted_tokens ? upcomingGuardRails?.accepted_tokens : "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>
      </Flex>
      <Heading size="xl" fontWeight="medium" my={6}>
        Whitelisted addresses
      </Heading>
      <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" mb={5} w="full">
        <Flex flexWrap="wrap" justifyContent={{ base: "center", lg: "normal" }} mx={{ base: 0, lg: 10 }} my="5">
          {whitelistedAddress}
        </Flex>
      </Box>
    </Flex>
  );
};
